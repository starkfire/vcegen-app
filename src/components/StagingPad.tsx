import { FileIcon, Loader2, X } from "lucide-react"
import { useParser, type Result } from "@/app/providers/parser";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { 
    Dropzone,
    DropzoneDescription,
    DropzoneGroup,
    DropzoneInput,
    DropzoneTitle,
    DropzoneUploadIcon,
    DropzoneZone
} from "@/components/ui/dropzone"
import {
    FileList,
    FileListItem,
    FileListHeader,
    FileListAction,
    FileListInfo,
    FileListDescription,
    FileListDescriptionText,
    FileListName,
    FileListIcon,
    FileListSize,
    FileListDescriptionSeparator
} from "@/components/ui/file-list"
import {
    Tabs,
    TabsList,
    TabsContent,
    TabsTrigger
} from "@/components/ui/tabs"

import type { DropEvent } from "react-dropzone";

type StagingPadProps = {
    title: string;
    description?: string;
    className?: string;
}

type FileItemProps = {
    file?: File | null
}

type ResultCardProps = {
    data: Result,
    className?: string
}

function ResultCard({ data, ...props }: ResultCardProps) {
    return (
        <Card className={props.className}>
            <CardHeader>
                <CardTitle className="tracking-tight text-md font-bold">
                    {data.question_number ?? "[NO NUMBER ATTACHED]"}. {data.question_text ?? "[NO QUESTION ATTACHED]"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="[&>*]:mb-4">
                    <div>
                    {
                        data.choices.map((choice) => (
                            <p>{choice}</p>
                        ))
                    }
                    </div>
                    <div>
                        <p>
                            <span className="font-semibold tracking-tight">Answer: </span>
                            {data.answer ?? "[NO ANSWER ATTACHED]"}
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold tracking-tight">Rationale:</p>
                        {
                            (data.rationale && data.rationale.length > 0) && data.rationale.map((rationale) => (
                                <p>{rationale}</p>
                            ))
                        }
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function FileItem(props: FileItemProps) {
    return (
        <FileListItem>
            <FileListHeader>
                <FileListIcon>
                    <FileIcon />
                </FileListIcon>
                <FileListInfo>
                    <FileListName>{props.file && props.file.name}</FileListName>
                    <FileListDescription>
                        <FileListSize>
                            {(props.file && props.file.size) ? props.file.size : 0}
                        </FileListSize>
                        <FileListDescriptionSeparator />
                        <FileListDescriptionText>
                            <Loader2 className="size-3 animate-spin" />
                            Processing document...
                        </FileListDescriptionText>
                    </FileListDescription>
                </FileListInfo>
                <FileListAction>
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                </FileListAction>
            </FileListHeader>
        </FileListItem>
    )
}

export function StagingPad(props: StagingPadProps) {
    const parser = useParser()

    const onValidDrop = async (files: File[], _: DropEvent) => {
        parser.setFile(files[0])
    }

    return (
        <div>
            {
                (!parser.isLoading && !parser.file) && (
                    <Dropzone
                        accept={{
                            "application/pdf": [".pdf"]
                        }}
                        onDropAccepted={onValidDrop}
                        maxFiles={1}
                    >
                        <DropzoneZone className={props.className}>
                            <DropzoneInput />
                            <DropzoneGroup>
                                <DropzoneUploadIcon />
                                <DropzoneGroup>
                                    <DropzoneTitle>
                                        {props.title}
                                    </DropzoneTitle>
                                    <DropzoneDescription>
                                        {props.description}
                                    </DropzoneDescription>                 
                                </DropzoneGroup>
                            </DropzoneGroup>
                        </DropzoneZone>
                    </Dropzone>
                )
            }
            {
                (parser.isLoading && parser.file) && (
                    <FileList>
                        <FileItem file={parser.file} />
                    </FileList>
                )
            }
            {
                (!parser.isLoading && parser.file) && (
                    <Tabs defaultValue="valid">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger className="font-semibold" value="valid">
                                Valid Rows
                            </TabsTrigger>
                            <TabsTrigger className="font-semibold" value="invalid">
                                Invalid Rows
                            </TabsTrigger>
                            <TabsTrigger className="font-semibold" value="source">
                                Source View
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="valid">
                            {
                                parser.results.map((result) => (
                                    <ResultCard 
                                        className="my-2 rounded border-b"
                                        data={result} 
                                    />
                                ))
                            }
                        </TabsContent>
                        <TabsContent value="invalid">
                            {
                                parser.invalidRows.map((row) => (
                                    <ResultCard 
                                        className="my-2 rounded border-b"
                                        data={row} 
                                    />
                                ))
                            }
                        </TabsContent>
                        <TabsContent value="source">
                            
                        </TabsContent>
                    </Tabs>
                )
            }
        </div>
    )
}