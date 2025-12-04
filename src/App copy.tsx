import { ReactFlowProvider } from '@xyflow/react';
import 'antd/dist/reset.css';
import '@xyflow/react/dist/style.css';
import { useEffect, useState } from 'react';
import { Button, Modal, Input, List, message } from 'antd';
import { useHistoryState } from './hooks/useHistoryState';
import './AppStyles.css';
import FlowCanvas from './FlowCanvas';
import { loadFlowState, saveFlowState, listDrafts, saveDraft, loadDraft, deleteDraft } from './storage/indexedDb';

const initialNodes = [
  {
    id: 'text-to-text-1',
    type: 'textToText',
    position: { x: 100, y: 150 },
    data: {
      label: 'Text to Text',
      instruction: '',
      model: 'GPT-4o Mini',
    },
  },
  {
    id: 'text-to-image-1',
    type: 'textToImage',
    position: { x: 650, y: 150 },
    data: {
      label: 'Text to Image',
      instruction: '',
      model: 'Hailuo Image 01',
      aspectRatio: '16:9',
    },
  },
];

const initialEdges = [
  {
    id: 'edge-1',
    source: 'text-to-text-1',
    target: 'text-to-image-1',
    sourceHandle: 'text-output',
    targetHandle: 'text-input',
    animated: true,
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
  },
];

export default function App() {
  // 尝试从 IndexedDB 或 localStorage 恢复上次编辑内容
  const [bootstrap, setBootstrap] = useState<{ nodes: any[]; edges: any[] } | null>(null as any);
  const {
    state: flowState,
    setState: setFlowState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistoryState(
    bootstrap && Array.isArray(bootstrap.nodes) && Array.isArray(bootstrap.edges)
      ? { nodes: bootstrap.nodes, edges: bootstrap.edges }
      : { nodes: initialNodes, edges: initialEdges }
  );

  // Drafts UI state
  const [draftModal, setDraftModal] = useState(false);
  const [manageModal, setManageModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftList, setDraftList] = useState<string[]>([]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  // 将当前画布状态持久化（localStorage）以支持离线编辑恢复
  useEffect(() => {
    try {
      localStorage.setItem('flow-state', JSON.stringify(flowState));
      saveFlowState(flowState);
    } catch {
      // 忽略持久化错误
    }
  }, [flowState]);

  // 异步引导：优先从 IndexedDB 加载，失败则回退 localStorage
  useEffect(() => {
    let mounted = true;
    (async () => {
      const idb = await loadFlowState();
      if (mounted && idb && Array.isArray(idb.nodes) && Array.isArray(idb.edges)) {
        setBootstrap({ nodes: idb.nodes, edges: idb.edges });
        return;
      }
      try {
        const raw = localStorage.getItem('flow-state');
        if (mounted && raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            setBootstrap({ nodes: parsed.nodes, edges: parsed.edges });
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Refresh drafts list when manage modal opens
  useEffect(() => {
    if (manageModal) {
      (async () => {
        setDraftList(await listDrafts());
      })();
    }
  }, [manageModal]);

  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white shrink-0">
          <div className="text-sm font-medium text-gray-700">AI Workflow Builder</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              size="small"
            >
              ↶ Undo
            </Button>
            <span className="hidden md:inline text-xs text-gray-400">Ctrl+Z</span>
            <Button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
              size="small"
            >
              ↷ Redo
            </Button>
            <span className="hidden md:inline text-xs text-gray-400">Ctrl+Shift+Z / Ctrl+Y</span>
            <span className="mx-2 h-5 w-px bg-gray-200" />
            <Button size="small" onClick={() => setDraftModal(true)}>Save Draft</Button>
            <Button size="small" onClick={() => setManageModal(true)}>Manage Drafts</Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <FlowCanvas
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            flowState={flowState}
            setFlowState={setFlowState}
          />
        </div>

        {/* Save Draft Modal */}
        <Modal
          title="Save Draft"
          open={draftModal}
          onCancel={() => setDraftModal(false)}
          onOk={async () => {
            const name = draftName.trim();
            if (!name) { message.warning('Please enter a draft name'); return; }
            await saveDraft(name, flowState);
            message.success('Draft saved');
            setDraftModal(false);
          }}
        >
          <Input
            placeholder="Draft name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
        </Modal>

        {/* Manage Drafts Modal */}
        <Modal
          title="Manage Drafts"
          open={manageModal}
          onCancel={() => setManageModal(false)}
          footer={null}
        >
          <List
            dataSource={draftList}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button size="small" key="load" onClick={async () => {
                    const state = await loadDraft(item);
                    if (state && Array.isArray(state.nodes) && Array.isArray(state.edges)) {
                      setFlowState(() => state, false, true);
                      message.success('Draft loaded');
                      setManageModal(false);
                    } else {
                      message.error('Invalid draft');
                    }
                  }}>Load</Button>,
                  <Button size="small" key="rename" onClick={async () => {
                    const newName = await new Promise<string | null>((resolve) => {
                      Modal.confirm({
                        title: '重命名草稿',
                        content: (
                          <Input autoFocus defaultValue={item} onChange={(e) => (window as any)._renameDraftTemp = e.target.value} />
                        ),
                        okText: '保存',
                        cancelText: '取消',
                        onOk: () => resolve((window as any)._renameDraftTemp || item),
                        onCancel: () => resolve(null),
                      });
                    });
                    if (newName && newName !== item) {
                      const data = await loadDraft(item);
                      if (data) {
                        await saveDraft(newName, data);
                        await deleteDraft(item);
                        setDraftList(await listDrafts());
                        message.success('重命名成功');
                      }
                    }
                  }}>Rename</Button>,
                  <Button size="small" danger key="delete" onClick={async () => {
                    await deleteDraft(item);
                    setDraftList(await listDrafts());
                    message.success('Draft deleted');
                  }}>Delete</Button>
                ]}
              >
                {item}
              </List.Item>
            )}
          />
        </Modal>
      </div>
    </ReactFlowProvider>
  );
}
