import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ReactFlow, {
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  MarkerType,
  getRectOfNodes,
  getTransformForBounds,
} from "react-flow-renderer";
import { toPng } from "html-to-image";
import dagre from "dagre";
import { mindMapService } from "@/services/api";
import { Loader2, RotateCw, Download, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

// Node Styles Configuration
const nodeStyles = {
  main: {
    background: "white",
    color: "black",
    border: "2px solid #dc2626",
    borderRadius: "8px",
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    minWidth: "180px",
    textAlign: "center",
  },
  subtopic: {
    background: "#fbbf24",
    color: "black",
    border: "2px solid #f59e0b",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    minWidth: "150px",
    textAlign: "center",
  },
  detail: {
    background: "#10b981",
    color: "black",
    border: "2px solid #059669",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "500",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    maxWidth: "200px",
    textAlign: "center",
  },
};

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 250;
  const nodeHeight = 80;
  const isHorizontal = direction === "LR";

  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const MindMapContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const { fitView, getNodes } = useReactFlow();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const videoUrl = urlParams.get("url");

  const fetchMindMap = useCallback(async (direction = "LR") => {
    if (!videoUrl) return;

    try {
      setLoading(true);
      const decodedUrl = decodeURIComponent(videoUrl);
      const mindMap = await mindMapService.generateMindMap(decodedUrl);

      if (!mindMap.topic || !mindMap.subtopics) {
        throw new Error("Invalid API Response");
      }

      const newNodes = [];
      const newEdges = [];

      // Main Topic Node
      newNodes.push({
        id: "root",
        type: "default",
        data: { label: mindMap.topic },
        position: { x: 0, y: 0 },
        style: nodeStyles.main,
      });

      mindMap.subtopics.forEach((subtopic, index) => {
        const subtopicId = `subtopic-${index}`;

        // Subtopic Nodes
        newNodes.push({
          id: subtopicId,
          type: "default",
          data: { label: subtopic.name },
          position: { x: 0, y: 0 },
          style: nodeStyles.subtopic,
        });

        newEdges.push({
          id: `e-root-${subtopicId}`,
          source: "root",
          target: subtopicId,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#ef4444", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#ef4444",
          },
        });

        // Detail Nodes
        subtopic.details.forEach((detail, detailIndex) => {
          const detailId = `${subtopicId}-detail-${detailIndex}`;

          newNodes.push({
            id: detailId,
            type: "default",
            data: { label: detail },
            position: { x: 0, y: 0 },
            style: nodeStyles.detail,
          });

          newEdges.push({
            id: `e-${subtopicId}-${detailId}`,
            source: subtopicId,
            target: detailId,
            type: "smoothstep",
            style: { stroke: "#f59e0b", strokeWidth: 2 },
          });
        });
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        newNodes,
        newEdges,
        direction
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      setTimeout(() => {
        fitView({ padding: 0.2, duration: 1000 });
      }, 100);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [videoUrl, fitView, setNodes, setEdges]);

  useEffect(() => {
    fetchMindMap(isHorizontal ? "LR" : "TB");
  }, []);

  const toggleOrientation = () => {
    const newOrientation = !isHorizontal;
    setIsHorizontal(newOrientation);
    fetchMindMap(newOrientation ? "LR" : "TB");
  };

  const downloadImage = () => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(
      nodesBounds,
      nodesBounds.width,
      nodesBounds.height,
      0.5,
      2
    );

    const viewportElement = document.querySelector('.react-flow__viewport');
    
    if (viewportElement) {
      toPng(viewportElement, {
        backgroundColor: '#000000',
        width: nodesBounds.width,
        height: nodesBounds.height,
        style: {
          width: nodesBounds.width + 'px',
          height: nodesBounds.height + 'px',
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', 'mindmap.png');
        a.setAttribute('href', dataUrl);
        a.click();
      });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Header Section */}
      <div className="text-center pt-24 pb-4">
        <h1 className="text-5xl font-bold mb-4 text-white">
          Mind<span className="text-green-500">Map</span>
        </h1>
        <p className="text-gray-400 text-xl">
          Visualize your learning with AI-powered mind maps
        </p>
      </div>

      <div className="container mx-auto px-6 pb-6">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <motion.button
            onClick={() => navigate("/quiz")}
            className="flex items-center gap-2 px-6 py-2 bg-[#95ff00]/10 text-base font-medium rounded-full border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20 hover:border-[#95ff00]/50 transition-all duration-300 relative overflow-hidden group"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(0, 255, 157, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-[#95ff00]/10"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">← Back to Quiz</span>
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              onClick={toggleOrientation}
              className="flex items-center gap-2 px-6 py-2 bg-[#95ff00]/10 text-base font-medium rounded-full border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20 hover:border-[#95ff00]/50 transition-all duration-300 relative overflow-hidden group"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0, 255, 157, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-[#95ff00]/10"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                {isHorizontal ? "Switch to Vertical" : "Switch to Horizontal"}
              </span>
            </motion.button>
            <motion.button
              onClick={downloadImage}
              className="flex items-center gap-2 px-6 py-2 bg-[#95ff00]/10 text-base font-medium rounded-full border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20 hover:border-[#95ff00]/50 transition-all duration-300 relative overflow-hidden group"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0, 255, 157, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-[#95ff00]/10"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export as Image
              </span>
            </motion.button>
            <motion.button
              onClick={() => fetchMindMap(isHorizontal ? "LR" : "TB")}
              className="flex items-center gap-2 px-6 py-2 bg-[#95ff00]/10 text-base font-medium rounded-full border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20 hover:border-[#95ff00]/50 transition-all duration-300 relative overflow-hidden group"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0, 255, 157, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-[#95ff00]/10"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">+ Generate Mind Map</span>
            </motion.button>
          </div>
        </div>

        {/* Mind Map Canvas */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden" style={{ height: "calc(100vh - 300px)", minHeight: "500px" }}>
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                <p className="text-green-200 font-medium">Generating Mind Map...</p>
              </div>
            </div>
          )}

          <div className="w-full h-full bg-black relative">
            <p className="text-gray-500 text-sm p-3 absolute top-0 left-0 z-10">
              Use mouse wheel to zoom • Drag to pan
            </p>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              minZoom={0.1}
              maxZoom={4}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
              }}
              className="bg-black"
              style={{ width: '100%', height: '100%' }}
            >
              <Background color="#1f2937" gap={20} size={1} />
              <Controls className="bg-gray-800 border-gray-700 text-gray-400" />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
};

const MindMap = () => {
  return (
    <ReactFlowProvider>
      <MindMapContent />
    </ReactFlowProvider>
  );
};

export default MindMap;