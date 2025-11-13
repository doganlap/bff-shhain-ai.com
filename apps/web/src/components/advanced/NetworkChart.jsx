import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const NetworkChart = ({
  nodes = [],
  connections = [],
  onNodeClick,
  className = ''
}) => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Calculate node positions in a circular layout
  const calculatePositions = () => {
    const centerX = 300;
    const centerY = 200;
    const radius = 120;
    
    return nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  };

  const positionedNodes = calculatePositions();

  const handleNodeClick = (node) => {
    setSelectedNode(node.id);
    onNodeClick?.(node);
  };

  const getNodeColor = (node) => {
    if (selectedNode === node.id) return '#10b981';
    if (hoveredNode === node.id) return '#3b82f6';
    return node.color || '#6366f1';
  };

  const getConnectionOpacity = (connection) => {
    if (!selectedNode) return 0.3;
    return connection.source === selectedNode || connection.target === selectedNode ? 0.8 : 0.1;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">مخطط الشبكة</h3>
        <p className="text-sm text-gray-600">انقر على العقد لاستكشاف الاتصالات</p>
      </div>
      
      <div className="relative">
        <svg
          ref={svgRef}
          width="600"
          height="400"
          viewBox="0 0 600 400"
          className="w-full h-auto border border-gray-100 rounded"
        >
          {/* Connections */}
          {connections.map((connection, index) => {
            const sourceNode = positionedNodes.find(n => n.id === connection.source);
            const targetNode = positionedNodes.find(n => n.id === connection.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return (
              <motion.line
                key={`connection-${index}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="#e5e7eb"
                strokeWidth={connection.weight || 2}
                opacity={getConnectionOpacity(connection)}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            );
          })}

          {/* Nodes */}
          {positionedNodes.map((node, index) => (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size || 20}
                fill={getNodeColor(node)}
                stroke="#ffffff"
                strokeWidth="3"
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />
              
              {/* Node Label */}
              <text
                x={node.x}
                y={node.y + (node.size || 20) + 15}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-medium pointer-events-none"
              >
                {node.label}
              </text>
              
              {/* Node Value/Count */}
              {node.value && (
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="fill-white text-xs font-bold pointer-events-none"
                >
                  {node.value}
                </text>
              )}
            </motion.g>
          ))}
        </svg>

        {/* Node Details Panel */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-xs"
          >
            {(() => {
              const node = positionedNodes.find(n => n.id === selectedNode);
              return (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{node?.label}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {node?.description && (
                      <p>{node.description}</p>
                    )}
                    {node?.value && (
                      <div className="flex justify-between">
                        <span>القيمة:</span>
                        <span className="font-medium">{node.value}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>الاتصالات:</span>
                      <span className="font-medium">
                        {connections.filter(c => c.source === selectedNode || c.target === selectedNode).length}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="mt-3 text-xs text-blue-600 hover:text-blue-800"
                  >
                    إغلاق
                  </button>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
            <span>عقدة عادية</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>محوم عليها</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>محددة</span>
          </div>
        </div>
        <div>
          {nodes.length} عقدة، {connections.length} اتصال
        </div>
      </div>
    </div>
  );
};

export default NetworkChart;
