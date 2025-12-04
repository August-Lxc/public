import { Handle, Position } from '@xyflow/react';
import { useState, type ChangeEvent } from 'react';
import { Button, Input } from 'antd';
import './NodeStyles.css';

interface TextToTextNodeProps {
  data: {
    label?: string;
    instruction?: string;
    model?: string;
  };
}

export default function TextToTextNode({ data }: TextToTextNodeProps) {
  const [instruction, setInstruction] = useState(data.instruction || '');
  const [model] = useState(data.model || 'GPT-4o Mini');

  return (
    <div className="custom-node text-to-text-node bg-white rounded-2xl shadow-sm border-2 border-green-500 w-[440px]">
      <Handle
        type="target"
        position={Position.Left}
        id="text-input"
        style={{ top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, background: '#22c55e', borderRadius: 2, border: '1px solid #16a34a' }}
      />
      <div className="node-header flex items-center justify-between px-4 py-2">
        <div className="node-title flex items-center gap-2 text-sm text-gray-700">
          <span className="node-icon">✨</span>
          <span className="node-name font-medium">Text to Text</span>
          <span className="node-time text-xs text-gray-400">⏱ 5s</span>
        </div>
        <Button shape="circle" size="small" className="play-button">▶</Button>
      </div>

      <div className="h-px bg-green-400/50 mx-4" />
      <div className="node-content p-4 space-y-4">
        <div className="form-section space-y-2">
          <label className="form-label text-xs font-medium text-gray-600">
            Creative Instruction <span className="required text-red-500">*</span>
          </label>
          <div className="flex items-center justify-between">
            <Button size="small" className="add-pdf-btn">📎 Add PDF</Button>
          </div>
          <Input.TextArea
            className="instruction-textarea"
            value={instruction}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInstruction(e.target.value)}
            placeholder="Describe the story, or idea you want to explore"
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </div>

        <div className="form-section space-y-2">
          <label className="form-label text-xs font-medium text-gray-600">
            Choose AI Model(s) <span className="required text-red-500">*</span>
          </label>
          <div className="model-selector flex items-center justify-between">
            <Button size="small" className="add-model-btn">+ Add models</Button>
            <div className="selected-model flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md border border-gray-200 text-xs">
              <span className="model-icon">🤖</span>
              <span className="text-gray-700">{model}</span>
              <Button size="small" type="text" className="remove-btn">🗑</Button>
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="text-output"
        style={{ top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, background: '#22c55e', borderRadius: 2, border: '1px solid #16a34a' }}
      />
    </div>
  );
}
