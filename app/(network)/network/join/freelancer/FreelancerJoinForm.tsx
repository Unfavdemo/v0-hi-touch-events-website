"use client";

import { useState, useTransition } from "react";
import { FileDropField } from "@/components/network/FileDropField";
import { ImageDropField } from "@/components/network/ImageDropField";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Textarea } from "@/components/network/ui/Textarea";
import { registerFreelancer } from "@/lib/network/auth-actions";
import { cn } from "@/lib/network/utils";

interface TagOption {
  id: string;
  name: string;
}

type EntityType = "INDIVIDUAL" | "BUSINESS";
type Tier = "STANDARD" | "PRO";

const STEPS = ["Account", "Entity", "Skills", "Paperwork", "Membership"] as const;

const TIERS: { id: Tier; name: string; price: string; blurb: string }[] = [
  {
    id: "STANDARD",
    name: "Standard",
    price: "$49/mo",
    blurb: "Opportunity invites matched to your skills, applications, ratings profile, payout tracking.",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$99/mo",
    blurb: "Everything in Standard plus a priority boost in opportunity matching.",
  },
];

export function FreelancerJoinForm({ tags }: { tags: TagOption[] }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Step 1 — account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 — entity
  const [type, setType] = useState<EntityType>("INDIVIDUAL");
  const [companyName, setCompanyName] = useState("");
  const [portrait, setPortrait] = useState<File | null>(null);
  const [taxIdLast4, setTaxIdLast4] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Step 3 — skills
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Step 4 — paperwork
  const [w9, setW9] = useState<File | null>(null);
  const [acceptAgreement, setAcceptAgreement] = useState(false);

  // Step 5 — tier
  const [tier, setTier] = useState<Tier>("STANDARD");

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (name.trim().length < 2) return "Enter your full name.";
      if (!email.includes("@")) return "Enter a valid email.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (phone.replace(/\D/g, "").length < 7) {
        return "Enter a phone number we can call or text.";
      }
    }
    if (step === 1) {
      if (type === "BUSINESS" && companyName.trim().length < 2)
        return "Enter your business name.";
      if (!/^\d{4}$/.test(taxIdLast4))
        return `Enter the last 4 digits of your ${type === "INDIVIDUAL" ? "SSN" : "EIN"}.`;
      if (mailingAddress.trim().length < 8) return "Enter a mailing address.";
    }
    if (step === 2 && selectedTags.length === 0) {
      return "Pick at least one skill category.";
    }
    if (step === 3) {
      if (!w9) return "Upload a current IRS Form W-9.";
      if (!acceptAgreement) return "Please accept the vendor agreement.";
    }
    return null;
  }

  function next() {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function submit() {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("type", type);
      fd.set("name", name);
      fd.set("email", email);
      fd.set("phone", phone);
      fd.set("mailingAddress", mailingAddress);
      if (bio) fd.set("bio", bio);
      fd.set("password", password);
      if (type === "BUSINESS") fd.set("companyName", companyName);
      fd.set("taxIdLast4", taxIdLast4);
      if (instagram) fd.set("instagram", instagram);
      if (facebook) fd.set("facebook", facebook);
      if (tiktok) fd.set("tiktok", tiktok);
      if (linkedin) fd.set("linkedin", linkedin);
      if (website) fd.set("website", website);
      for (const id of selectedTags) fd.append("categoryTagIds", id);
      fd.set("tier", tier);
      if (portrait) fd.set("portrait", portrait);
      if (w9) fd.set("w9", w9);
      if (acceptAgreement) fd.set("acceptAgreement", "1");
      const result = await registerFreelancer(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <ol className="grid grid-cols-5 gap-px border-2 border-ht-line bg-ht-line">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "ht-label px-2 py-2 text-center",
              i === step
                ? "bg-ht-blue text-white"
                : i < step
                  ? "bg-ht-panel-2 text-ht-gold"
                  : "bg-ht-panel text-ht-muted",
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 space-y-5">
        {step === 0 ? (
          <>
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone for calls and texts"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                hint="HiTouch and partners use this number to reach you"
                required
              />
            </div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="At least 8 characters"
              required
            />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="grid grid-cols-2 gap-px border-2 border-ht-line bg-ht-line">
              {(["INDIVIDUAL", "BUSINESS"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "px-4 py-3 text-base font-semibold uppercase tracking-wider transition-colors",
                    type === t
                      ? "bg-ht-blue text-white"
                      : "bg-ht-panel text-ht-muted hover:text-ht-cream",
                  )}
                >
                  {t === "INDIVIDUAL" ? "Individual" : "Business"}
                </button>
              ))}
            </div>

            {type === "BUSINESS" ? (
              <Input
                label="Business name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            ) : null}

            <Input
              label={type === "BUSINESS" ? "Business mailing address" : "Mailing address"}
              value={mailingAddress}
              onChange={(e) => setMailingAddress(e.target.value)}
              placeholder="Street, city, state, ZIP"
              hint="Shown on your public profile for partners"
              required
            />

            <ImageDropField
              label={
                type === "BUSINESS"
                  ? "Company logo or owner photo (optional)"
                  : "Headshot (optional)"
              }
              previewAlt={
                type === "BUSINESS" ? companyName || "Company logo" : name || "Headshot"
              }
              onFileChange={setPortrait}
            />

            <Input
              label={type === "BUSINESS" ? "EIN — last 4 digits" : "SSN — last 4 digits"}
              value={taxIdLast4}
              onChange={(e) => setTaxIdLast4(e.target.value)}
              maxLength={4}
              inputMode="numeric"
              required
            />

            <Textarea
              label="Bio (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Experience, service area, gear, crew size..."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@handle"
              />
              <Input
                label="Facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="Page URL"
              />
              <Input
                label="TikTok"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@handle"
              />
              <Input
                label="LinkedIn"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/you"
              />
              <Input
                label="Your website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="yourstudio.com"
              />
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <div>
            <p className="ht-label text-ht-muted">
              Select every category you can staff
            </p>
            <div className="mt-3 grid grid-cols-2 gap-px border-2 border-ht-line bg-ht-line sm:grid-cols-3">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "px-3 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-ht-blue text-white"
                        : "bg-ht-panel text-ht-muted hover:text-ht-cream",
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <p className="text-sm text-ht-muted">
              We need a current IRS Form W-9 and your acceptance of the vendor agreement
              before you can apply to opportunities. Partners never see your W-9.{" "}
              <a
                href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-ht-gold hover:text-ht-gold-bright"
              >
                Get the form from the IRS
              </a>. We keep it off your public profile.
            </p>
            <FileDropField
              label="Form W-9"
              name="w9"
              stamp="W-9"
              emptyPrompt="Drop your W-9 here, or click to browse"
              hint="PDF, JPEG, or PNG, under 8 MB. You can add a COI and other files after you join, under Documents."
              onFileChange={setW9}
            />
            <label className="flex cursor-pointer items-start gap-3 text-sm text-ht-cream">
              <input
                type="checkbox"
                checked={acceptAgreement}
                onChange={(e) => setAcceptAgreement(e.target.checked)}
                className="mt-1 accent-[#34318f]"
              />
              <span>
                I have read and accept the{" "}
                <a
                  href="/network/legal/vendor-agreement"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ht-gold hover:text-ht-gold-bright"
                >
                  HiTouch Vendor Agreement
                </a>.
              </span>
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            {TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTier(t.id)}
                className={cn(
                  "block w-full border-2 p-5 text-left transition-colors",
                  tier === t.id
                    ? "border-ht-gold bg-ht-panel-2"
                    : "border-ht-line bg-ht-panel hover:border-ht-line-strong",
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold text-ht-cream">{t.name}</span>
                  <span className="text-xl font-bold text-ht-gold">{t.price}</span>
                </div>
                <p className="mt-2 text-sm text-ht-muted">{t.blurb}</p>
              </button>
            ))}
            <p className="border-2 border-ht-blue-dim bg-ht-panel px-4 py-3 text-sm text-ht-blue-bright">
              Beta tester? Enter your promo code on the checkout page for a 100% fee
              waiver.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="border-2 border-ht-danger/60 px-4 py-3 text-sm text-ht-danger">
            {error}
          </p>
        ) : null}

        <div
          className={
            step === 0
              ? "flex items-center justify-end border-t-2 border-ht-line pt-5"
              : "flex items-center justify-between gap-3 border-t-2 border-ht-line pt-5"
          }
        >
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={back} disabled={pending}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={pending}>
              {pending ? "Submitting…" : "Submit & continue to checkout"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
