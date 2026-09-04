import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/server/lib/prisma";

interface ClerkUserCreatedEvent {
  type: string;
  data: {
    id: string;
    email_addresses: {
      id: string;
      email_address: string;
    }[];
    primary_email_address_id: string | null;
    phone_numbers: {
      id: string;
      phone_number: string;
    }[];
    primary_phone_number_id: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

function getPrimaryEmail(data: ClerkUserCreatedEvent["data"]): string | null {
  const email =
    data.email_addresses.find(
      (email) => email.id === data.primary_email_address_id
    )?.email_address ?? data.email_addresses[0]?.email_address;

  return email?.trim().toLowerCase() || null;
}

function getPrimaryPhone(data: ClerkUserCreatedEvent["data"]): string {
  return (
    data.phone_numbers.find(
      (phone) => phone.id === data.primary_phone_number_id
    )?.phone_number ??
    data.phone_numbers[0]?.phone_number ??
    ""
  );
}

function getUserName(data: ClerkUserCreatedEvent["data"]): string {
  const name = [data.first_name, data.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Patient";
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Clerk Webhook] CLERK_WEBHOOK_SECRET is not configured");
    return new Response("Server misconfiguration", { status: 500 });
  }

  // ------------------------------------------------------------
  // 1. Read Svix headers
  // ------------------------------------------------------------

  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("[Clerk Webhook] Missing Svix headers");

    return new Response("Missing Svix headers", {
      status: 400,
    });
  }

  // ------------------------------------------------------------
  // 2. Read and verify webhook body
  // ------------------------------------------------------------

  const body = await req.text();

  const webhook = new Webhook(webhookSecret);

  let event: ClerkUserCreatedEvent;

  try {
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch (error) {
    console.error(
      "[Clerk Webhook] Signature verification failed:",
      error
    );

    return new Response("Invalid signature", {
      status: 400,
    });
  }

  // ------------------------------------------------------------
  // 3. Only process user.created
  // ------------------------------------------------------------

  if (event.type !== "user.created") {
    console.log(
      `[Clerk Webhook] Ignoring event: ${event.type}`
    );

    return new Response("Event ignored", {
      status: 200,
    });
  }

  const { id: clerkUserId } = event.data;

  // ------------------------------------------------------------
  // 4. Extract and normalize user information
  // ------------------------------------------------------------

  const email = getPrimaryEmail(event.data);

  if (!email) {
    console.error(
      `[Clerk Webhook] No email found for Clerk user ${clerkUserId}`
    );

    return new Response("No email on user", {
      status: 400,
    });
  }

  const name = getUserName(event.data);
  const phone = getPrimaryPhone(event.data);

  try {
    // ----------------------------------------------------------
    // 5. Check whether this email has a StaffUser invite
    // ----------------------------------------------------------

    const staffUser = await prisma.staffUser.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        clerkUserId: true,
        name: true,
        isActive: true,
      },
    });

    // ----------------------------------------------------------
    // 6. Pending StaffUser invite
    //
    // A pending invite is identified by:
    // clerkUserId === null
    // ----------------------------------------------------------

    if (staffUser && staffUser.clerkUserId === null) {
      await prisma.staffUser.update({
        where: {
          id: staffUser.id,
        },
        data: {
          clerkUserId,
          name,
          isActive: true,
        },
      });

      console.log(
        `[Clerk Webhook] StaffUser provisioned successfully: ${email}`
      );

      return new Response("StaffUser provisioned", {
        status: 200,
      });
    }

    // ----------------------------------------------------------
    // 7. Existing StaffUser already linked
    //
    // Do NOT overwrite an existing Clerk account.
    // ----------------------------------------------------------

    if (
      staffUser &&
      staffUser.clerkUserId !== null &&
      staffUser.clerkUserId !== clerkUserId
    ) {
      console.error(
        `[Clerk Webhook] Email ${email} is already linked to another Clerk user`
      );

      return new Response(
        "Email already belongs to another staff account",
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------------------------
    // 8. Patient provisioning
    //
    // No pending StaffUser invite exists, so this user is a
    // normal patient.
    // ----------------------------------------------------------

    await prisma.patient.upsert({
      where: {
        clerkUserId,
      },
      update: {
        name,
        email,
        phone,
      },
      create: {
        clerkUserId,
        name,
        email,
        phone,
      },
    });

    console.log(
      `[Clerk Webhook] Patient provisioned successfully: ${email}`
    );

    return new Response("Patient provisioned", {
      status: 200,
    });
  } catch (error) {
    console.error(
      `[Clerk Webhook] Database error for Clerk user ${clerkUserId}:`,
      error
    );

    return new Response("Database error", {
      status: 500,
    });
  }
}