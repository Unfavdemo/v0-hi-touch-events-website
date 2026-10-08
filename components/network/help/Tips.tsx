import { InfoTip } from "@/components/network/help/HelpDialog";
import {
  APPLICANT_PRICE_WEIGHT,
  APPLICANT_VENDOR_WEIGHT,
  INVITE_TARGET,
  WEIGHTS,
} from "@/lib/network/matching";

export { EventTimesTip, OpenBoardTip } from "@/components/network/help/FormTips";

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function EventStatusTip() {
  return (
    <InfoTip title="Opportunity statuses">
      <ul>
        <li>
          <strong>Pending approval</strong>{" "}— HiTouch is verifying your opportunity. Vendors
          can&apos;t see it yet.
        </li>
        <li>
          <strong>Active</strong>{" "}— live. Invites are out and vendors can apply.
        </li>
        <li>
          <strong>Filled</strong>{" "}— you hired someone. Remaining invites are closed.
        </li>
        <li>
          <strong>Completed</strong>{" "}— the opportunity happened. Leave a review for your vendor.
        </li>
      </ul>
      <p>Use the filter tabs above your opportunities to jump between these stages.</p>
      <p>
        <strong>Invite only</strong>{" "}opportunities are shown only to vendors we (or you) invite.{" "}
        <strong>Open board</strong>{" "}opportunities are also listed for every vendor in that category.
      </p>
    </InfoTip>
  );
}

export function MatchScoreTip() {
  return (
    <InfoTip title="How the match score works">
      <p>
        Every vendor gets a score out of 100 for each opportunity. Only vetted, paid-up vendors in
        the opportunity&apos;s category who are <strong>free for your whole setup-to-breakdown
        window</strong>{" "}are considered.
      </p>
      <ul>
        <li>
          <strong>{pct(WEIGHTS.quality)} ratings</strong>{" "}— reviews from HiTouch and past
          clients. New vendors start near 4★ until they&apos;re rated.
        </li>
        <li>
          <strong>{pct(WEIGHTS.experience)} experience</strong>{" "}— completed jobs, especially
          in this category.
        </li>
        <li>
          <strong>{pct(WEIGHTS.partnerFit)} history with you</strong>{" "}— past opportunitys, how
          you rated them, and vendors you marked as favorites on My Vendors.
        </li>
        <li>
          <strong>{pct(WEIGHTS.responsiveness)} reliability</strong>{" "}— how often they reply
          (apply or decline) when invited.
        </li>
        <li>
          <strong>{pct(WEIGHTS.rotation)} fair rotation</strong>{" "}— a boost for good vendors
          who haven&apos;t been booked recently, so work is spread around.
        </li>
        <li>
          <strong>{pct(WEIGHTS.priority)} Pro membership</strong>{" "}— priority placement.
        </li>
      </ul>
      <p>A high score means a strong fit — not a guarantee. You always make the final call.</p>
    </InfoTip>
  );
}

export function TopPicksTip() {
  return (
    <InfoTip title="Top picks from applicants">
      <p>Once vendors apply, we re-rank them with a <strong>fit</strong>{" "}score:</p>
      <ul>
        <li>
          <strong>{pct(APPLICANT_VENDOR_WEIGHT)}</strong>{" "}their match score (ratings,
          experience, history with you, reliability).
        </li>
        <li>
          <strong>{pct(APPLICANT_PRICE_WEIGHT)}</strong>{" "}price — quotes at or under your
          posted rate get full credit, dropping to zero at double the rate.
        </li>
      </ul>
      <p>
        The <strong>Best match</strong>{" "}is our strongest recommendation, followed by picks #2
        and #3. Anyone who has since been booked on an overlapping opportunity drops down and
        can&apos;t be hired. Click <strong>Hire</strong>{" "}on whoever you choose — the others
        are notified automatically.
      </p>
    </InfoTip>
  );
}

export function InvitesTip() {
  return (
    <InfoTip title="Invited vendors">
      <p>
        When your opportunity goes live we invite the top {INVITE_TARGET} available matches. If
        someone declines, the next-best vendor is invited so you always have a full
        shortlist.
      </p>
      <ul>
        <li>
          <strong>Recommended</strong>{" "}— invited by our matching.
        </li>
        <li>
          <strong>Hand-picked</strong>{" "}— invited by you.
        </li>
        <li>
          <strong>Awaiting reply</strong>{" "}— they haven&apos;t responded yet.
        </li>
        <li>
          <strong>Applied</strong>{" "}— they&apos;re in your applicant list.
        </li>
        <li>
          <strong>Closed</strong>{" "}— the spot was filled before they replied.
        </li>
      </ul>
    </InfoTip>
  );
}

export function AvailableVendorsTip() {
  return (
    <InfoTip title="More available vendors">
      <p>
        These vendors fit your category, are free for your whole opportunity window, and
        haven&apos;t been invited yet. They&apos;re ordered by match score.
      </p>
      <p>
        Use <strong>Invite to apply</strong>{" "}to hand-pick someone, or{" "}
        <strong>Invite next 3 best matches</strong>{" "}to widen your shortlist in one click.
        Vendors booked elsewhere at that time are hidden.
      </p>
    </InfoTip>
  );
}

export function RecommendationPreviewTip() {
  return (
    <InfoTip title="Recommended vendors (preview)">
      <p>
        This is who our matching would invite right now. The list refreshes when HiTouch
        approves your opportunity — the top {INVITE_TARGET} available vendors at that moment get
        invites.
      </p>
    </InfoTip>
  );
}

export function VendorDirectoryTip() {
  return (
    <InfoTip title="Finding vendors">
      <p>
        Everyone here has been reviewed and approved by HiTouch. Sort is by rating; filter
        by category or search by name, company, or specialty.
      </p>
      <p>
        <strong>Favorite</strong>{" "}someone to keep them on My Vendors and boost them in
        matching. <strong>Block</strong>{" "}hides them from this list and from invites on
        your opportunities.
      </p>
      <p>
        <strong>Invite to apply</strong>{" "}appears when you have a live opportunity in one of the
        vendor&apos;s categories. We check they&apos;re free for that opportunity before sending
        the invite.
      </p>
    </InfoTip>
  );
}

export function VendorInvitesTip() {
  return (
    <InfoTip title="How opportunity invites work">
      <p>
        When a partner&apos;s opportunity goes live, we rank every available vendor in that
        category and invite the top {INVITE_TARGET}. Partners can also hand-pick you.
      </p>
      <p>You rank higher when you:</p>
      <ul>
        <li>earn strong ratings from HiTouch and clients,</li>
        <li>complete more jobs in your categories,</li>
        <li>apply to (or decline) invites instead of ignoring them,</li>
        <li>keep your calendar open — booked vendors aren&apos;t matched to overlapping opportunities.</li>
      </ul>
      <p>
        An invite is a shortlist spot, not a booking. The partner compares everyone who
        applies and hires one vendor.
      </p>
    </InfoTip>
  );
}

export function QuoteTip() {
  return (
    <InfoTip title="Writing your application">
      <p>
        Your <strong>quote</strong>{" "}is what you&apos;ll charge for this opportunity. Partners see
        applicants ranked by fit, and quotes at or under the posted rate score best — quotes
        above it lose ground the higher they go.
      </p>
      <p>
        Use <strong>notes</strong>{" "}to stand out: relevant opportunities, gear you bring, crew size,
        or anything extra you&apos;ll include.
      </p>
    </InfoTip>
  );
}

export function PaperworkTip() {
  return (
    <InfoTip title="W-9 and vendor agreement">
      <p>
        Every vendor keeps a current IRS <strong>Form W-9</strong>{" "}on the{" "}
        <strong>Documents</strong>{" "}page and accepts the{" "}
        <strong>HiTouch Vendor Agreement</strong>{" "}on Profile before they can apply or be
        hired. You can also store a certificate of insurance and other files there.
      </p>
      <p>
        You and HiTouch can always open your files. Other vendors cannot. After a partner
        hires you, they can open your <strong>W-9</strong>{" "}and{" "}
        <strong>certificate of insurance</strong>. Extra files stay with HiTouch. Upload a
        new W-9 in Documents if your tax details change.
      </p>
    </InfoTip>
  );
}

export function ApplicationStatusTip() {
  return (
    <InfoTip title="Application statuses">
      <ul>
        <li>
          <strong>Under review</strong>{" "}— the partner hasn&apos;t decided yet.
        </li>
        <li>
          <strong>Hired</strong>{" "}— you got it. The opportunity is on your Overview.
        </li>
        <li>
          <strong>Not selected</strong>{" "}— the partner hired someone else. Keep applying;
          every completed job raises your match score.
        </li>
      </ul>
    </InfoTip>
  );
}

export function RatingTip() {
  return (
    <InfoTip title="Your rating">
      <p>
        After every completed opportunity you&apos;re reviewed twice — once by HiTouch and once
        by the client. Your rating is the average of all of them.
      </p>
      <ul>
        <li>Higher ratings are the biggest factor in how often you&apos;re invited.</li>
        <li>Below <strong>3.5</strong>{" "}you&apos;ll get a warning.</li>
        <li>
          Below <strong>3.0</strong>{" "}the HiTouch team reviews your account, and you may be
          removed from the network.
        </li>
      </ul>
    </InfoTip>
  );
}

export function SkillCategoriesTip() {
  return (
    <InfoTip title="Skill categories">
      <p>
        You&apos;re only matched and invited to opportunities in the categories you select, and the
        job board is filtered to them too. Pick every category you can genuinely staff —
        but only those, since ratings in each category affect future matches.
      </p>
    </InfoTip>
  );
}

export function MembershipTip() {
  return (
    <InfoTip title="Membership">
      <p>
        An active membership keeps you eligible for invites and applications.{" "}
        <strong>Pro</strong>{" "}members get a boost in opportunity matching. Beta members have fees
        waived during the launch period.
      </p>
    </InfoTip>
  );
}

export function PaymentsTip({ partner = false }: { partner?: boolean }) {
  if (partner) {
    return (
      <InfoTip title="Paying vendors">
        <p>
          After you hire someone, pay them the agreed amount outside HiTouch — check, bank
          transfer, card, or cash. Then <strong>mark as paid</strong> so you and the vendor
          both have a record. You can undo it with <em>Not paid</em> if you marked it by
          mistake. Open <strong>Reports</strong> for year-to-date spend and a 1099-NEC
          worksheet — HiTouch does not file the form.
        </p>
      </InfoTip>
    );
  }
  return (
    <InfoTip title="Payments">
      <p>
        Partners mark you paid after each hired opportunity. This page also shows Gusto payroll
        records HiTouch keeps for you. Open <strong>Reports</strong> for year-to-date totals by
        client. Reach out to HiTouch under <strong>Support</strong> if something looks off.
      </p>
    </InfoTip>
  );
}

export function VendorCalendarTip() {
  return (
    <InfoTip title="Calendar">
      <p>
        See booked opportunitys, open invites, and personal blackouts in one month view. Blackouts
        use the same setup-to-breakdown window as matching — you won&apos;t be invited when
        you&apos;re blocked.
      </p>
    </InfoTip>
  );
}

export function VendorReportsTip() {
  return (
    <InfoTip title="Earnings reports">
      <p>
        Totals follow the year you were paid or, if still open, the year the opportunity ran.
        Gold bars are amounts partners marked paid; gray is still outstanding. Clients
        issue <strong>1099-NEC</strong> when required — HiTouch does not file for you.
      </p>
    </InfoTip>
  );
}

export function VendorReviewsTip() {
  return (
    <InfoTip title="Reviews">
      <p>
        HiTouch and each client can review you after a completed opportunity. Your average drives
        matching. Thresholds from platform settings (typically warning below 3.5, review
        below 3.0) show as banners here.
      </p>
    </InfoTip>
  );
}

export function VendorClientsTip() {
  return (
    <InfoTip title="Clients">
      <p>
        Everyone who hired you on HiTouch, plus partners who favorited you on{" "}
        <strong>My Vendors</strong>. Favorites can boost how often you&apos;re matched to
        their opportunities.
      </p>
    </InfoTip>
  );
}

export function VendorCrewTip() {
  return (
    <InfoTip title="Crew">
      <p>
        For business vendors only. Add staff you send on site, then check them on each
        booked opportunity. Partners see names and roles on the opportunity page — crew do not get
        logins.
      </p>
    </InfoTip>
  );
}

export function VendorSupportTip() {
  return (
    <InfoTip title="Support">
      <p>
        Incidents HiTouch logged on your account and completed opportunitys still unpaid after 30
        days. Email the team if a partner payment or dispute needs escalation.
      </p>
    </InfoTip>
  );
}

export function VendorSettingsTip() {
  return (
    <InfoTip title="Settings">
      <p>
        Password, timezone, and emergency contact stay private. Notification toggles are
        saved for your account; in-app alerts in the sidebar still appear for now.
      </p>
    </InfoTip>
  );
}

export function ReportsTip() {
  return (
    <InfoTip title="Spend reports">
      <p>
        Totals use the date you <strong>marked a vendor paid</strong>, not the opportunity date.
        Vendors at $600 or more in a calendar year are flagged for Form 1099-NEC. Download
        the CSV for your accountant. This is a record of what you marked in HiTouch — not a
        filed IRS return.
      </p>
    </InfoTip>
  );
}

export function ApproveEventTip() {
  return (
    <InfoTip title="Approving opportunities">
      <p>
        Check the opportunity details and pay rate are reasonable, then approve. Approving
        publishes the opportunity and <strong>immediately invites the top {INVITE_TARGET}</strong>{" "}
        available matching vendors. The partner is notified too.
      </p>
    </InfoTip>
  );
}

export function DismissalFlagTip() {
  return (
    <InfoTip title="Ratings & dismissal flags">
      <p>
        Vendors averaging under <strong>3.5</strong>{" "}are warned automatically. Under{" "}
        <strong>3.0</strong>{" "}they&apos;re flagged here for review. Flagged vendors stop
        receiving invites until you clear the flag or suspend them.
      </p>
    </InfoTip>
  );
}
