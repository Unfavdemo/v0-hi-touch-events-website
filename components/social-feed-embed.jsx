"use client"

import { ElfsightWidget } from "next-elfsight-widget"
import { socialFeedElfsightWidgetId } from "@/lib/site"

/**
 * Elfsight Instagram feed via next-elfsight-widget → react-elfsight-widget.
 * Loads platform.js from static.elfsight.com (Elfsight’s supported URL); the raw
 * elfsightcdn.com snippet alone often fails under Next.js / Turbopack.
 *
 * @see https://github.com/elfsight/next-elfsight-widget
 */
export function SocialFeedEmbed({ widgetId = socialFeedElfsightWidgetId } = {}) {
  if (!widgetId) return null

  return (
    <div className="elfsight-root min-h-[24rem] w-full">
      <ElfsightWidget widgetId={widgetId} className="w-full" lazy={false} />
    </div>
  )
}
