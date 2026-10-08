import type { AdminScope, Role } from "@/lib/generated/network-prisma/client";
import type { ReactNode } from "react";
import { HelpDialog } from "@/components/network/help/HelpDialog";
import { DEFAULT_INVITE_TARGET } from "@/lib/network/platform-settings";

export function HowToUseButton({
  role,
  adminScope,
  inviteTarget = DEFAULT_INVITE_TARGET,
}: {
  role: Role;
  adminScope?: AdminScope | null;
  inviteTarget?: number;
}) {
  const guide =
    role === "ADMIN" && adminScope === "EVENT"
      ? EVENT_ADMIN_GUIDE
      : role === "PARTNER"
        ? partnerGuide(inviteTarget)
        : role === "ADMIN"
          ? adminGuide(inviteTarget)
          : GUIDES.FREELANCER;
  return (
    <HelpDialog
      title={guide.title}
      label="How to use"
      triggerClassName="justify-start border-white/40 text-white hover:border-white hover:bg-white/10"
    >
      {guide.body}
    </HelpDialog>
  );
}

function partnerGuide(inviteTarget: number) {
  return {
    title: "How to use the Partner Portal",
    body: (
      <>
        <p>
          You tell us about your opportunity, we invite the best vendors who are free that day, and
          you choose who to hire from the people who apply.
        </p>
        <ol>
          <li>
            <strong>Post an opportunity.</strong>{" "}Pick a category (DJ, catering, photography…), set
            your pay rate, and enter the setup, live, and breakdown times. Vendors booked
            anywhere in that window won&apos;t be recommended.
          </li>
          <li>
            <strong>HiTouch verifies it.</strong>{" "}Our team reviews every opportunity before vendors
            see it. You&apos;ll get a notification when it&apos;s approved.
          </li>
          <li>
            <strong>We invite the top {inviteTarget} matches.</strong>{" "}Our matching ranks
            available vendors on ratings, experience, history with you, and reliability, then
            invites them to apply. If someone declines, the next-best vendor is invited
            automatically.
          </li>
          <li>
            <strong>Review applicants.</strong>{" "}Open the opportunity from <em>Your Opportunities</em>.
            Applicants appear ranked, with our <em>Top picks</em> highlighted and the reasons
            behind each one.
          </li>
          <li>
            <strong>Hire.</strong>{" "}Click <em>Hire</em> on the vendor you want. Everyone else is
            notified that the spot is filled.
          </li>
          <li>
            <strong>Pay the vendor.</strong>{" "}Send payment outside HiTouch, then open{" "}
            <em>Payments</em> and mark them paid so you both have a record.{" "}
            <em>Reports</em> rolls those marks into spend by month and a year-end 1099
            worksheet.
          </li>
          <li>
            <strong>After the opportunity,</strong>{" "}mark it completed and leave a review from{" "}
            <em>Reviews</em> or the opportunity page. Reviews shape future recommendations. If HiTouch
            staff worked the opportunity instead of a network vendor, there is no vendor rating — admin
            team members are not reviewed on the network.
          </li>
          <li>
            <strong>Keep company details current</strong>{" "}on <em>Organization</em>, including
            saved venues for the next posting. Add coordinators there so they share the same
            opportunities. Hired vendors&apos; W-9s and certificates of insurance live under{" "}
            <em>Documents</em>. Duplicate a past opportunity from Your Opportunities when the next one looks
            the same. Use <em>Calendar</em> to scan the month, and <em>Messages</em> for
            day-of logistics with the hired vendor.
          </li>
        </ol>
        <p>
          Want someone specific? Use <strong>Find Vendors</strong>{" "}to browse the network, or
          reopen people you already know on <strong>My Vendors</strong>. Favorite vendors
          you want again; block anyone you don&apos;t want invited.
        </p>
        <p className="text-sm text-ht-muted">
          Look for the small <strong>?</strong>{" "}buttons around the portal for quick
          explanations.
        </p>
      </>
    ),
  };
}

const GUIDES: Record<"FREELANCER", { title: string; body: ReactNode }> = {
  FREELANCER: {
    title: "How to use the Vendor Portal",
    body: (
      <>
        <p>
          Partners post opportunities and HiTouch invites the best-matched vendors who are free to
          apply. An invite puts you on the shortlist — the partner still chooses who to hire.
        </p>
        <ol>
          <li>
            <strong>Complete your profile and paperwork.</strong>{" "}Add a headshot or logo,
            mailing address, a phone we can call or text, your website, bio, and your{" "}
            <em>skill categories</em>. Upload a{" "}
            <em>W-9</em> under Documents and accept the vendor agreement — you can&apos;t apply or be hired
            until those are on file.
          </li>
          <li>
            <strong>Watch your Invites.</strong>{" "}You&apos;ll get a notification and see the
            opportunity under <em>Invites</em>, along with why you were matched.
          </li>
          <li>
            <strong>Apply or decline.</strong>{" "}Apply with your quote and a short note, or
            decline so the spot goes to someone else. Replying either way counts in your
            favor; ignoring invites lowers how often you&apos;re matched.
          </li>
          <li>
            <strong>Get hired.</strong>{" "}Track everything under <em>My Applications</em>. If
            you&apos;re picked, the opportunity appears on your Overview and{" "}
            <em>Calendar</em>. Check in when you arrive and mark wrapped when you&apos;re done.
            Block off-platform time under <em>Calendar</em> so you aren&apos;t invited when
            you&apos;re unavailable. Partners pay you after the opportunity and mark it on their
            Payments page — you&apos;ll see that under <em>Payments</em> and{" "}
            <em>Reports</em>. Day-of notes live under <em>Messages</em>. Business vendors can
            assign <em>Crew</em> on booked opportunitys.
          </li>
          <li>
            <strong>Do great work.</strong>{" "}After each opportunity HiTouch and the client both rate
            you on <em>Reviews</em>. On completed jobs you can also rate the partner who hired
            you. Higher ratings rank you higher in future matches. Keep{" "}
            <em>Membership</em> active and account details under <em>Settings</em>.
          </li>
        </ol>
        <p>
          The <strong>Job Board</strong>{" "}lists the few opportunities partners opened to everyone in
          your categories — anyone can apply to those without an invite.
        </p>
        <p className="text-sm text-ht-muted">
          Look for the small <strong>?</strong>{" "}buttons around the portal for quick
          explanations.
        </p>
      </>
    ),
  },
};

function adminGuide(inviteTarget: number) {
  return {
    title: "How to use the Admin Console",
    body: (
      <>
        <p>You keep the network trustworthy: who gets in, which opportunities go live, and quality.</p>
        <ol>
          <li>
            <strong>Applications and members.</strong>{" "}New vendor and partner applications wait on{" "}
            <em>Applications</em>. Open <em>Vendors</em> or <em>Partners</em> for the full
            lists, and a person&apos;s name for their private dossier. Confirm the W-9 and
            agreement before you approve. <em>Documents</em> and <em>Compliance</em> cover
            files and expirations.
          </li>
          <li>
            <strong>Verify opportunities.</strong>{" "}Partner opportunities land in <em>Opportunities → Pending
            approval</em>. Approving publishes the opportunity and immediately invites the top{" "}
            {inviteTarget} matching vendors. <em>Schedule</em> shows the next two weeks and
            staffing gaps.
          </li>
          <li>
            <strong>Monitor hiring and matching.</strong>{" "}Open any opportunity to see invites and
            applicants. <em>Matching</em> shows acceptance and vendors sitting on invites.
          </li>
          <li>
            <strong>Money.</strong>{" "}<em>Payouts</em> is the ledger of vendor pay partners
            marked. <em>Memberships</em> shows plans, overdue payments, and Stripe customers.
          </li>
          <li>
            <strong>Trust.</strong>{" "}Leave the internal HiTouch review on completed opportunitys.
            <em>Reviews</em> lets you hide unfair scores. <em>Incidents</em> logs no-shows
            and complaints. Thresholds live under <em>Settings</em>.
          </li>
          <li>
            <strong>Assign opportunity admins.</strong>{" "}Add them on <em>Team</em>, then open an
            opportunity and assign them. They only see those opportunities plus Schedule, Payouts, and
            Reviews for that work.
          </li>
        </ol>
        <p>
          Posting an opportunity yourself skips verification and sends invites right away. Use{" "}
          <em>Announcements</em>, <em>Activity</em>, <em>Reports</em>, and <em>Categories</em>{" "}
          when you need the wider board.
        </p>
      </>
    ),
  };
}

const EVENT_ADMIN_GUIDE = {
  title: "How to use Opportunity Admin",
  body: (
    <>
      <p>
        A full HiTouch admin may assign you to specific opportunities. You can also post your own
        opportunities. On those opportunities you can hire, invite, complete, review, and record pay.
      </p>
      <ol>
        <li>
          <strong>Post an opportunity</strong> or open <em>Your Opportunities</em>. You will not see
          the rest of the board.
        </li>
        <li>
          <strong>Work the opportunity.</strong> Approve it if it is still pending, invite or hire
          vendors, mark it completed, and leave the HiTouch review.
        </li>
        <li>
          <strong>Use Your tools.</strong> <em>Schedule</em> shows your next two weeks and
          staffing gaps. <em>Payouts</em> records vendor pay on your opportunities. <em>Reviews</em>{" "}
          lists scores from those opportunities — hide one if it should not count.
        </li>
      </ol>
      <p className="text-sm text-ht-muted">
        You cannot approve members, open all vendor documents, or manage the full admin console.
      </p>
    </>
  ),
};
