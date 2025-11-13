import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIMindMap = ({
  centralTopic,
  branches = [],
  onNodeClick,
  className = ''
}) => {
  const [selectedNode, setSelectedNode] = useState('');
  const [hoveredNode, setHoveredNode] = useState('');

  const handleNodeClick = useCallback((nodeId, title) => {
    setSelectedNode(nodeId);
    onNodeClick?.(nodeId, title);
  }, [onNodeClick]);

  const calculateNodePosition = (index, total, radius = 200) => {
    const angle = (2 * Math.PI * index) / total;
    const x = 400 + radius * Math.cos(angle);
    const y = 300 + radius * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className={`w-full h-96 relative border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 800 600">
        {/* Connection Lines */}
        {branches.map((branch, index) => {
          const pos = calculateNodePosition(index, branches.length);
          return (
            <motion.line
              key={`line-${branch.id}`}
              x1="400"
              y1="300"
              x2={pos.x}
              y2={pos.y}
              stroke="#e5e7eb"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          );
        })}

        {/* Central Node */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <circle
            cx="400"
            cy="300"
            r="60"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="4"
            className="cursor-pointer"
            onClick={() => handleNodeClick('central', centralTopic)}
          />
          <text
            x="400"
            y="305"
            textAnchor="middle"
            className="fill-white text-sm font-medium pointer-events-none"
          >
            {centralTopic.length > 12 ? `${centralTopic.substring(0, 12)}...` : centralTopic}
          </text>
        </motion.g>

        {/* Branch Nodes */}
        {branches.map((branch, index) => {
          const pos = calculateNodePosition(index, branches.length);
          const isSelected = selectedNode === branch.id;
          const isHovered = hoveredNode === branch.id;
          
          return (
            <motion.g
              key={branch.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected || isHovered ? "45" : "40"}
                fill={isSelected ? "#10b981" : "#6366f1"}
                stroke="#ffffff"
                strokeWidth="3"
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleNodeClick(branch.id, branch.title)}
                onMouseEnter={() => setHoveredNode(branch.id)}
                onMouseLeave={() => setHoveredNode('')}
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                className="fill-white text-xs font-medium pointer-events-none"
              >
                {branch.title.length > 10 ? `${branch.title.substring(0, 10)}...` : branch.title}
              </text>

              {/* Subtopic indicators */}
              {branch.subtopics && branch.subtopics.length > 0 && (
                <circle
                  cx={pos.x + 25}
                  cy={pos.y - 25}
                  r="8"
                  fill="#f59e0b"
                  className="pointer-events-none"
                />
              )}
            </motion.g>
          );
        })}

        {/* Subtopics for selected node */}
        <AnimatePresence>
          {selectedNode && branches.find(b => b.id === selectedNode)?.subtopics && (
            <>
              {branches.find(b => b.id === selectedNode).subtopics.map((subtopic, subIndex) => {
                const mainPos = calculateNodePosition(
                  branches.findIndex(b => b.id === selectedNode), 
                  branches.length
                );
                const subAngle = (2 * Math.PI * subIndex) / branches.find(b => b.id === selectedNode).subtopics.length;
                const subX = mainPos.x + 80 * Math.cos(subAngle);
                const subY = mainPos.y + 80 * Math.sin(subAngle);

                return (
                  <motion.g
                    key={subtopic.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, delay: subIndex * 0.05 }}
                  >
                    <line
                      x1={mainPos.x}
                      y1={mainPos.y}
                      x2={subX}
                      y2={subY}
                      stroke="#d1d5db"
                      strokeWidth="1"
                    />
                    <circle
                      cx={subX}
                      cy={subY}
                      r="20"
                      fill="#f3f4f6"
                      stroke="#9ca3af"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onClick={() => handleNodeClick(subtopic.id, subtopic.title)}
                    />
                    <text
                      x={subX}
                      y={subY + 3}
                      textAnchor="middle"
                      className="fill-gray-700 text-xs pointer-events-none"
                    >
                      {subtopic.title.length > 6 ? `${subtopic.title.substring(0, 6)}...` : subtopic.title}
                    </text>
                  </motion.g>
                );
              })}
            </>
          )}
        </AnimatePresence>
      </svg>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>المركز الرئيسي</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
          <span>الفروع</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>محدد</span>
        </div>
      </div>
    </div>
  );
};

export default AIMindMap;
