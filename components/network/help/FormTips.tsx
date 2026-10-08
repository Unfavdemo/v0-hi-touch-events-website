import { InfoTip } from "@/components/network/help/HelpDialog";

export function EventTimesTip() {
  return (
    <InfoTip title="Why we ask for four times">
      <ul>
        <li>
          <strong>Setup arrival</strong>{" "}— when the vendor must be on site.
        </li>
        <li>
          <strong>Live start / end</strong>{" "}— the live portion.
        </li>
        <li>
          <strong>Breakdown</strong>{" "}— when they must be packed and gone.
        </li>
      </ul>
      <p>
        We only recommend vendors who are free from setup through breakdown, so enter the
        full window to avoid double-booking.
      </p>
    </InfoTip>
  );
}

export function OpenBoardTip() {
  return (
    <InfoTip title="Invite-only vs. open board">
      <p>
        By default opportunities are <strong>invite-only</strong>: only the vendors our matching
        invites (plus anyone the partner hand-picks) can apply. That keeps applicant lists
        short and high-quality.
      </p>
      <p>
        Opportunities marked <strong>open board</strong>{" "}are also listed on the job board, where any
        vetted vendor in the category can apply. Useful for hard-to-fill roles or last-minute
        opportunities.
      </p>
    </InfoTip>
  );
}
