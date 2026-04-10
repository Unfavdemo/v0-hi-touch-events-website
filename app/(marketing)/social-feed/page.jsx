import { PageHero } from "@/components/page-hero"
import { SocialFeedEmbed } from "@/components/social-feed-embed"
import { SocialFeedGrid } from "@/components/social-feed-grid"
import { contact, getInquiryMailtoHref, socialFeedElfsightWidgetId } from "@/lib/site"

export const metadata = {
  title: "Social Feed | HiTouch Enterprises Inc.",
  description: "Highlights from the field—builds, shows, and behind-the-scenes moments.",
}

export default function SocialFeedPage() {
  const useLiveFeed = socialFeedElfsightWidgetId.length > 0

  return (
    <>
      <PageHero
        eyebrow="What's new"
        title="Social feed"
        subtitle="A living scrapbook of load-ins, show days, and strike wins."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Social feed", href: "/social-feed" },
        ]}
        variant="cinematic"
      />
      <section className="bg-background pb-24 dark:bg-black page-px">
        <div className="container mx-auto w-full min-w-0 max-w-5xl">
          {useLiveFeed ? (
            <SocialFeedEmbed />
          ) : (
            <SocialFeedGrid />
          )}
          <p className="mx-auto mt-14 max-w-2xl text-center text-muted-foreground">
            {useLiveFeed ? (
              <>
                Feed updates automatically from Instagram. You can also open{" "}
                <a
                  href={contact.instagramUrl}
                  className="font-medium text-brand-ink underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @hitouchinc
                </a>{" "}
                in the app.
              </>
            ) : (
              <>
                For a live grid like{" "}
                <a
                  href="https://redrockentertainment.com/social-feed/"
                  className="font-medium text-brand-ink underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Redrock&rsquo;s social feed
                </a>
                , add an Instagram widget (they use{" "}
                <a
                  href="https://elfsight.com/instagram-feed-instashow/"
                  className="font-medium text-brand-ink underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Elfsight
                </a>
                ) and set{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                  NEXT_PUBLIC_ELFSIGHT_INSTAGRAM_FEED_CLASS
                </code>{" "}
                in{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">.env.local</code>. Until then,
                follow HiTouch on your preferred platform for updates from the field.
              </>
            )}
          </p>
          <p className="mt-6 text-center">
            <a
              href={getInquiryMailtoHref()}
              className="font-display inline-flex rounded-full border-2 border-brand px-8 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-brand/15"
            >
              Email us
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
