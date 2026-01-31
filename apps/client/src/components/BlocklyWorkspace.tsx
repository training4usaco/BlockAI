import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import * as libraryBlocks from 'blockly/blocks';
import * as En from 'blockly/msg/en';

import '../blocks/CustomBlocks';
import { toolbox } from "../toolbox";
import { FieldFilePicker } from '../fields/FieldFilePicker';

Blockly.common.defineBlocks(libraryBlocks);
Blockly.setLocale(En.default || En);

const BlocklyWorkspace: React.FC = () => {
    const blocklyDiv = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

    const [generatedCode, setGeneratedCode] = useState<string>('');

    const [logs, setLogs] = useState<string>("Ready to run...");
    const [plotImage, setPlotImage] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('');

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const runCode = async () => {
        if (!generatedCode) {
            alert("No code to run!");
            return;
        }

        setIsRunning(true);
        setLogs("");
        setPlotImage(null);
        setConnectionStatus('Connecting...');

        try {
            const filesToSend: { [key: string]: string } = {};
            const registry = FieldFilePicker.fileRegistry;
            for (const [filename, fileObject] of Object.entries(registry)) {
                if (generatedCode.includes(filename)) {
                    filesToSend[filename] = await readFileAsBase64(fileObject);
                }
            }

            setLogs("🔄 Connecting to backend...\n");

            const BACKEND_URL = "https://liualex54321--blockly-ml-backend-execute-python.modal.run";

            const response = await fetch(BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream",
                },
                body: JSON.stringify({
                    code: generatedCode,
                    files: filesToSend
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            if (!response.body) {
                throw new Error("No response body");
            }

            setConnectionStatus('Connected - streaming...');
            setLogs(prev => prev + "✅ Connected! Receiving output...\n\n");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });

                const messages = buffer.split('\n\n');
                buffer = messages.pop() || "";

                for (const message of messages) {
                    if (!message.trim()) continue;

                    const lines = message.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.substring(6);

                            try {
                                const msg = JSON.parse(jsonStr);

                                if (msg.type === "log") {
                                    setLogs(prev => prev + msg.data);
                                } else if (msg.type === "image") {
                                    setPlotImage(msg.data);
                                } else if (msg.type === "ping") {
                                    setConnectionStatus(`Running... (${msg.messages} messages)`);
                                }
                            } catch (e) {
                                console.warn("Failed to parse SSE data:", jsonStr, e);
                            }
                        }
                    }
                }
            }

            setConnectionStatus('Complete');
            setLogs(prev => prev + "\n✅ Done!");

        } catch (error: any) {
            console.error("=== Error ===", error);

            setConnectionStatus('Error');

            let errorMsg = `\n❌ Error: ${error.message || error}\n`;

            if (error.message?.includes("Failed to fetch")) {
                errorMsg += "\n🔍 Possible causes:\n";
                errorMsg += "1. Backend is not responding\n";
                errorMsg += "2. Network connection lost\n";
                errorMsg += "3. CORS issue\n";
            }

            setLogs(prev => prev + errorMsg);
        } finally {
            setIsRunning(false);
        }
    };

    useEffect(() => {
        if (!blocklyDiv.current) return;

        blocklyDiv.current.innerHTML = '';

        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
            toolbox: toolbox,
            grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
            zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        });

        const onBlockChange = () => {
            if (workspaceRef.current) {
                const importsCode =
                    'import torch\n' +
                    'import torch.nn.functional as F\n' +
                    'import matplotlib.pyplot as plt\n' +
                    'import math\n' +
                    'import os\n';

                try {
                    const blockCode = pythonGenerator.workspaceToCode(workspaceRef.current);
                    setGeneratedCode(importsCode + '\n' + blockCode);
                } catch (e) {
                    console.warn("Block generation error", e);
                }
            }
        };

        workspaceRef.current.addChangeListener(onBlockChange);

        return () => {
            workspaceRef.current?.dispose();
        };
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>

            <div style={{ flex: '2', position: 'relative', height: '100%', borderRight: '2px solid #ddd' }}>
                <div
                    ref={blocklyDiv}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, textAlign: 'left' }}
                />
            </div>

            <div style={{
                flex: '1',
                backgroundColor: '#1e1e1e',
                color: '#fff',
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>

                <div style={{ borderBottom: '1px solid #444', paddingBottom: '20px' }}>
                    <h3 style={{ marginTop: 0 }}>Controls</h3>

                    {connectionStatus && (
                        <div style={{
                            padding: '8px',
                            marginBottom: '10px',
                            backgroundColor: '#333',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                        }}>
                            Status: {connectionStatus}
                        </div>
                    )}

                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isRunning ? '#666' : '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}
                    >
                        {isRunning ? "Running Model..." : "Run Code 🚀"}
                    </button>
                </div>

                {plotImage && (
                    <div style={{ borderBottom: '1px solid #444', paddingBottom: '20px', textAlign: 'center' }}>
                        <h3>Results</h3>
                        <img
                            src={`data:image/png;base64,${plotImage}`}
                            alt="Model Plot"
                            style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid #555' }}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                    <h3 style={{ margin: 0 }}>Output Logs</h3>
                    <div style={{
                        backgroundColor: '#000',
                        padding: '10px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid #333',
                        maxHeight: '300px', 
                        overflowY: 'auto',   
                        boxSizing: 'border-box'
                    }}>
                        {logs}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    marginTop: '10px'
                }}>
                    <h3 style={{ margin: 0 }}>Generated Python</h3>
                    <pre style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#aaa',
                        backgroundColor: '#111',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #333',
                        margin: 0,
                        overflow: 'visible',
                        minHeight: '100px', 
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {generatedCode}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default BlocklyWorkspace;
