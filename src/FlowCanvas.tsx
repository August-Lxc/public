import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  NodeTypes,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import TextToTextNode from './components/TextToTextNode';
import TextToImageNode from './components/TextToImageNode';


function FitViewOnMount() {
  const reactFlow = useReactFlow();
  useEffect(() => {
    reactFlow.fitView({ padding: 0.25 });
    reactFlow.setViewport({ x: 0, y: 0, zoom: 0.5 });
  }, [reactFlow]);
  return null;
}

export default function FlowCanvas({
  undo,
  redo,
  canUndo,
  canRedo,
  flowState,
  setFlowState,
}: any) {
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      textToText: TextToTextNode,
      textToImage: TextToImageNode,
    }),
    []
  );

  // 记录拖动过程中的最新节点，用于拖动结束一次性提交历史
  const latestNodesRef = useRef<any[]>(flowState.nodes);
  const rafIdRef = useRef<number | null>(null);
  const pendingChangesRef = useRef<any[] | null>(null);
  useEffect(() => {
    latestNodesRef.current = flowState.nodes;
  }, [flowState.nodes]);

  const onNodesChange = useCallback(
    (changes: any) => {
      // 判断是否为拖动
      const isDragging = changes.some((c: any) => c.type === 'position' && c.dragging === true);
      const dragEnd = changes.some((c: any) => c.type === 'position' && c.dragging === false);

      // 使用 requestAnimationFrame 批处理拖动中的高频变更，减少重渲染
      if (isDragging) {
        pendingChangesRef.current = changes;
        if (rafIdRef.current == null) {
          rafIdRef.current = requestAnimationFrame(() => {
            const pending = pendingChangesRef.current;
            if (pending) {
              setFlowState((state: any) => ({
                ...state,
                nodes: applyNodeChanges(pending, state.nodes),
              }), true, false);
            }
            rafIdRef.current = null;
          });
        }
      } else {
        // 非拖动的节点变更，直接应用（不进历史）
        setFlowState((state: any) => ({
          ...state,
          nodes: applyNodeChanges(changes, state.nodes),
        }), false, false);
      }

      if (dragEnd) {
        const latestNodes = latestNodesRef.current;
        setFlowState((state: any) => ({ ...state, nodes: latestNodes }), false, true);
      }
    },
    [setFlowState]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setFlowState((state: any) => ({
        ...state,
        edges: applyEdgeChanges(changes, state.edges),
      }), false, true); // 低频操作直接入历史
    },
    [setFlowState]
  );

  const onConnect = useCallback(
    (connection: any) => {
      setFlowState((state: any) => ({
        ...state,
        edges: addEdge(connection, state.edges),
      }), false, true); // 连线完成直接入历史
    },
    [setFlowState]
  );

  return (
    <ReactFlow
      nodes={flowState.nodes}
      edges={flowState.edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
      minZoom={0.2}
      maxZoom={2}
      defaultEdgeOptions={{
        animated: true,
        style: { stroke: '#b1b1b7', strokeWidth: 2 },
      }}
    >
      <FitViewOnMount />
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
}
