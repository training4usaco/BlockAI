import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import '../blocks/CustomBlocks.tsx';
import {toolbox} from "../toolbox.ts";
import * as libraryBlocks from 'blockly/blocks';
import * as En from 'blockly/msg/en';

Blockly.common.defineBlocks(libraryBlocks);
Blockly.setLocale(En.default || En);

const BlocklyWorkspace: React.FC = () => {
    const blocklyDiv = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string>();
    
    useEffect(() => {
        if (!blocklyDiv.current) return;
        
        blocklyDiv.current.innerHTML = '';

        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
            toolbox: toolbox,
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true,
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2,
            },
        });

        const onBlockChange = () => {
            if (workspaceRef.current) {
                const importsCode =
                    'import torch\n' +
                    'import torch.nn.functional as F\n' +
                    'import matplotlib.pyplot as plt\n' +
                    'import math\n';

                const generatedCode = pythonGenerator.workspaceToCode(workspaceRef.current);
                
                const code = importsCode + '\n' + generatedCode;
                
                setGeneratedCode(code);
            }
        };
        
        workspaceRef.current.addChangeListener(onBlockChange);

        return () => {
            if (workspaceRef.current) {
                workspaceRef.current.dispose();
            }
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

            <div style={{ flex: '1', backgroundColor: '#1e1e1e', color: '#fff', padding: '20px', overflow: 'auto' }}>
                <h3>Generated Python</h3>
                <pre style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    {generatedCode}
                </pre>
            </div>
        </div>
    );
    
};

export default BlocklyWorkspace;