import { UploadIcon } from "lucide-react";
import { Button } from "./ui/button";

export function UploadFileButton() {
    return (
        <Button>
            <UploadIcon />
            <span>Upload Exam PDF</span>
        </Button>
    )
}