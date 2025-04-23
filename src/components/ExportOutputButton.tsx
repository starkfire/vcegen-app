import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParser } from "@/app/providers/parser";

export function ExportOutputButton() {
    const parser = useParser()

    const exportFile = async () => {
        let content = ""

        for (const row of parser.results) {
            content += `Question NO: ${row.question_number}\n`
            content += `${row.question_text}\n\n`

            for (const choice of row.choices) {
                content += `${choice}\n`
            }

            content += `\nAnswer: ${row.answer}\n\n`

            if (!parser.excludeRationale) {
                content += `Rationale:\n`

                if (row.rationale) {
                    row.choices.forEach((choice: string, idx: number) => {
                        if (idx < row.rationale!.length) {
                            content += `${choice}: ${row.rationale![idx]}\n`
                        } else {
                            content += `${choice}: No associated rationale for choice\n`
                        }
                    })
                } else {
                    row.choices.forEach((choice) => {
                        content += `${choice}: No rationale provided\n`
                    })
                }

                content += "\n"
            }

            content += "\n"
        }

        const blob = new Blob([content], { type: "text/plain" })
        const link = document.createElement("a")

        link.href = URL.createObjectURL(blob)
        link.download = "out.txt"

        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
    }

    return (
        <Button onClick={exportFile}>
            <DownloadIcon />
            <span>Export</span>
        </Button>
    )
}