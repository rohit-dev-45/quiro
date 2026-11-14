import { PlusIcon } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { SectionHeading } from "./section-heading";

const FAQS = [
    {
        question: "How Does Quiro Make Sure Answers Are Accurate?",
        answer: "Every Claim In An Answer Links To The Passage It Came From. Open The Source Reader To See The Exact Highlighted Text And The Page It Sits On. When Your Documents Don't Support An Answer, Quiro Says So Instead Of Guessing.",
    },
    {
        question: "What File Types Can I Upload?",
        answer: "Over 40 Formats, Including PDFs, Word Documents, Slides, Spreadsheets, And Plain Text. Scanned Files Are Run Through OCR Automatically, So Image-Only PDFs Become Searchable Too.",
    },
    {
        question: "Is My Data Private?",
        answer: "Your Documents Are Encrypted In Transit And At Rest In An Isolated, Per-Workspace Vector Store. They Are Never Used To Train Models, And Deleting A Document Removes Its Embeddings With It.",
    },
    {
        question: "Can Quiro Search Across Many Documents At Once?",
        answer: "Yes. Ask A Question Against A Single File Or Your Entire Library, And Quiro Retrieves From The Right Documents By Meaning Rather Than Keyword Matching Alone.",
    },
    {
        question: "Does It Integrate With My Existing Tools?",
        answer: "Pro And Business Connect To Google Drive And Notion To Keep Sources In Sync. Any Conversation Can Be Exported To Markdown Or Shared As A Link.",
    },
    {
        question: "What's The Difference Between Plans?",
        answer: "Questions Per Month Is The Only Limit That Changes. Free Covers 5 Documents And 5 Questions, Pro Removes The Document Limit And Raises Questions To 50, And Business Makes Questions Unlimited.",
    },
];

export function Faqs() {
    return (
        <section className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-24">
            <SectionHeading
                className="items-center text-center"
                eyebrow="FAQ"
                title="Questions, Answered."
            />

            <Accordion className="mt-10 border-t">
                {FAQS.map((faq) => (
                    <AccordionItem
                        key={faq.question}
                        value={faq.question}
                        className="border-b"
                    >
                        <AccordionTrigger className="cursor-pointer gap-6 py-4 text-base font-semibold **:data-[slot=accordion-trigger-icon]:hidden hover:no-underline">
                            {faq.question}
                            <PlusIcon className="mt-0.5 ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded/accordion-trigger:rotate-45" />
                        </AccordionTrigger>
                        <AccordionContent className="pr-10 pb-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}
