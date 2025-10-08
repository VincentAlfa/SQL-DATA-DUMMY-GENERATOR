"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Download, FileText, Upload } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  sqlContent: z.string().min(1, "SQL schema is required"),
  inputMethod: z.enum(["upload", "paste"]),
  file: z.instanceof(File).optional(),
})

type FormData = z.infer<typeof formSchema>

export default function SQLDummyDataGenerator() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedData, setGeneratedData] = useState("")
  const [streamingData, setStreamingData] = useState("")
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqlContent: "",
      inputMethod: "upload",
      file: undefined,
    },
  })

  const watchedInputMethod = form.watch("inputMethod")
  const watchedSqlContent = form.watch("sqlContent")
  const watchedFile = form.watch("file")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if ((uploadedFile && uploadedFile.type === "application/sql") || uploadedFile?.name.endsWith(".sql")) {
      form.setValue("file", uploadedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        form.setValue("sqlContent", content)
      }
      reader.readAsText(uploadedFile)
      setError("")
    } else {
      setError("Please upload a valid SQL file")
    }
  }

  const processSQL = async (data: FormData) => {
    if (!data.sqlContent) {
      setError("Please provide SQL schema first")
      return
    }

    setIsProcessing(true)
    setError("")
    setGeneratedData("")
    setStreamingData("")
    setDebugInfo("Starting request...")

    try {
      setDebugInfo("Sending request to API...")

      const response = await fetch("/api/generate-dummy-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sqlSchema: data.sqlContent }),
      })

      setDebugInfo(`Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error("No response body received")
      }

      setDebugInfo("Processing stream...")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedData = ""
      let chunkCount = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          setDebugInfo(`Stream completed. Total chunks: ${chunkCount}`)
          break
        }

        chunkCount++
        const chunk = decoder.decode(value, { stream: true })
        setDebugInfo(`Processing chunk ${chunkCount}...`)

        // Handle different streaming formats
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.trim()) {
            try {
              // Try parsing as JSON first
              if (line.startsWith("0:")) {
                const jsonStr = line.slice(2)
                const parsed = JSON.parse(jsonStr)
                if (parsed.type === "text-delta" && parsed.textDelta) {
                  accumulatedData += parsed.textDelta
                  setStreamingData(accumulatedData)
                }
              } else if (line.startsWith("data: ")) {
                // Handle Server-Sent Events format
                const jsonStr = line.slice(6)
                if (jsonStr !== "[DONE]") {
                  const parsed = JSON.parse(jsonStr)
                  if (parsed.choices?.[0]?.delta?.content) {
                    accumulatedData += parsed.choices[0].delta.content
                    setStreamingData(accumulatedData)
                  }
                }
              } else {
                accumulatedData += line
                setStreamingData(accumulatedData)
              }
            } catch (parseError) {
              console.log("Parse error, treating as text:", line.substring(0, 50))
              accumulatedData += line
              setStreamingData(accumulatedData)
            }
          }
        }
      }

      setGeneratedData(accumulatedData)
      setDebugInfo(`Generation complete. Total length: ${accumulatedData.length}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Error: ${errorMessage}`)
      setDebugInfo(`Error: ${errorMessage}`)
      console.error("Processing error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadResults = () => {
    const dataToDownload = generatedData || streamingData
    const blob = new Blob([dataToDownload], { type: "text/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dummy_data.sql"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetProcess = () => {
    form.reset({
      sqlContent: "",
      inputMethod: "upload",
      file: undefined,
    })
    setIsProcessing(false)
    setGeneratedData("")
    setStreamingData("")
    setError("")
    setDebugInfo("")
  }

  const displayData = generatedData || streamingData

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SQL Dummy Data Generator</h1>
          <p className="text-lg text-gray-600">Upload your SQL schema and let AI generate realistic dummy data</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processSQL)} className="space-y-8">
            {/* Input Method Selection */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>SQL Schema Input</CardTitle>
                <CardDescription>Choose how you want to provide your SQL schema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Method Selection Field */}
                  <FormField
                    control={form.control}
                    name="inputMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Input Method</FormLabel>
                        <FormControl>
                          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange("upload")
                                form.setValue("sqlContent", "")
                                form.setValue("file", undefined)
                              }}
                              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                field.value === "upload"
                                  ? "bg-white text-gray-900 shadow-sm"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <Upload className="w-4 h-4 inline mr-2" />
                              Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange("paste")
                                form.setValue("file", undefined)
                              }}
                              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                field.value === "paste"
                                  ? "bg-white text-gray-900 shadow-sm"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <FileText className="w-4 h-4 inline mr-2" />
                              Paste Text
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload Method */}
                  {watchedInputMethod === "upload" && (
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SQL File</FormLabel>
                          <FormControl>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <input
                                type="file"
                                accept=".sql"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="sql-upload"
                              />
                              <label htmlFor="sql-upload" className="cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-700">
                                  {watchedFile ? watchedFile.name : "Click to upload SQL file"}
                                </p>
                                <p className="text-sm text-gray-500">Supports .sql files up to 10MB</p>
                              </label>
                            </div>
                          </FormControl>
                          <FormDescription>Upload a .sql file containing your database schema</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Paste Text Method */}
                  {watchedInputMethod === "paste" && (
                    <FormField
                      control={form.control}
                      name="sqlContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SQL Schema</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value)
                                form.setValue("file", undefined) // Clear file when pasting
                              }}
                              placeholder="CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  ...
);"
                              className="h-48 font-mono text-sm"
                            />
                          </FormControl>
                          <FormDescription>Paste your SQL schema directly into this text area</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* SQL Content Preview (only show for file upload) */}
                  {watchedSqlContent && watchedInputMethod === "upload" && (
                    <FormField
                      control={form.control}
                      name="sqlContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SQL Content Preview</FormLabel>
                          <FormControl>
                            <Textarea
                              value={field.value.substring(0, 500) + (field.value.length > 500 ? "..." : "")}
                              readOnly
                              className="h-32 font-mono text-sm"
                            />
                          </FormControl>
                          <FormDescription>Preview of your uploaded SQL schema</FormDescription>
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={!watchedSqlContent || isProcessing} 
                      className="flex-1"
                    >
                      {isProcessing ? "Generating..." : "Generate Dummy Data"}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={resetProcess} 
                      variant="outline" 
                      disabled={isProcessing}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>

        {/* Debug Info */}
        {debugInfo && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Debug: {debugInfo}</AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {isProcessing && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating dummy data...</span>
                  <span>{streamingData.length > 0 ? "Streaming..." : "Starting..."}</span>
                </div>
                <Progress value={streamingData.length > 0 ? 75 : 25} />
                <p className="text-xs text-gray-500">
                  {debugInfo || (streamingData.length > 0 ? "Receiving data stream..." : "Analyzing schema...")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {displayData && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isProcessing ? "Generating Dummy Data..." : "Generated Dummy Data"}
                {isProcessing && (
                  <span className="ml-2 inline-flex items-center">
                    <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {isProcessing
                  ? "Your SQL INSERT statements are being generated in real-time"
                  : "Your SQL INSERT statements with realistic dummy data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Textarea value={displayData} readOnly className="h-64 font-mono text-sm" />
                  {isProcessing && (
                    <div className="absolute bottom-2 right-2">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Streaming...</div>
                    </div>
                  )}
                </div>
                <Button onClick={downloadResults} className="w-full" disabled={!displayData || isProcessing}>
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? "Generation in Progress..." : "Download SQL File"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
