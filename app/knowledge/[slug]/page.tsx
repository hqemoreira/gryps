import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getKnowledgeArticle,
  knowledgeSlugs,
} from "@/lib/knowledge-articles"
import { KnowledgeArticleView } from "../KnowledgeArticleView"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return knowledgeSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getKnowledgeArticle(slug)
  if (!article) return { title: "Evidence" }
  return {
    title: `${article.en.title} — GRYPS`,
    description: article.en.description,
    alternates: { canonical: `https://gryps.vercel.app/knowledge/${article.slug}` },
    keywords: article.primaryKeyword,
  }
}

export default async function KnowledgeArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getKnowledgeArticle(slug)
  if (!article) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: article.en.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: article.en.shortAnswer,
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KnowledgeArticleView article={article} />
    </>
  )
}
