# 🔄 REBUILD AND RUN GUIDE

## ✅ **Complete Rebuild Scripts Created!**

You now have two powerful rebuild scripts that will:
1. ✅ Clean all old installations
2. ✅ Rebuild Python virtual environments
3. ✅ Reinstall all dependencies
4. ✅ Set up project structures
5. ✅ Start services automatically

---

## 🚀 **QUICK START - Rebuild Everything**

### **Method 1: Batch Script (Easiest)**

Double-click or run:
```cmd
D:\LLM\REBUILD_AND_RUN.bat
```

### **Method 2: PowerShell (More Features)**

```powershell
cd D:\LLM
.\REBUILD_AND_RUN.ps1
```

---

## 🎯 **What Gets Rebuilt:**

### **AI Training Platform:**
```
✓ Delete old venv/
✓ Create new Python virtual environment
✓ Install Python dependencies:
  - torch, transformers, peft
  - fastapi, uvicorn
  - All training requirements
✓ Clean frontend node_modules/
✓ Reinstall Node.js dependencies (533 packages)
✓ Create directory structure
✓ Generate sample training data
```

### **Agent Factory:**
```
✓ Update Python dependencies
✓ Verify database
✓ Clean frontend node_modules/
✓ Reinstall Node.js dependencies
✓ Verify project structure
```

---

## ⏱️ **Rebuild Time:**

| Task | Duration |
|------|----------|
| Python environment setup | 30 seconds |
| Python dependencies install | 2-3 minutes |
| Frontend dependencies (AI Platform) | 2-3 minutes |
| Frontend dependencies (Agent Factory) | 1-2 minutes |
| **Total Time** | **~6-10 minutes** |

---

## 📊 **Rebuild Process Flow:**

```
┌─────────────────────────────────────────────┐
│  🔄 REBUILD AND RUN                         │
├─────────────────────────────────────────────┤
│                                             │
│  Phase 1: AI Training Platform              │
│  ├─ [■■■□□] Clean old environment          │
│  ├─ [■■■■□] Create venv                    │
│  ├─ [■■■■■] Install Python deps            │
│  ├─ [■■■■■] Install Node deps              │
│  └─ [■■■■■] Setup complete ✓               │
│                                             │
│  Phase 2: Agent Factory                     │
│  ├─ [■■■■□] Check dependencies             │
│  ├─ [■■■■■] Setup database                 │
│  ├─ [■■■■■] Install Node deps              │
│  └─ [■■■■■] Setup complete ✓               │
│                                             │
│  Phase 3: Start Services                    │
│  └─ Choose what to start                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎮 **Interactive Menu:**

After rebuild completes, you'll see:

```
╔══════════════════════════════════════════════════════════════╗
║              REBUILD COMPLETE - READY TO START               ║
╚══════════════════════════════════════════════════════════════╝

Select which system to start:

  [1] AI Training Platform (Ports 8000 + 3001)
  [2] Agent Factory (Ports 5000 + 3000)
  [3] BOTH SYSTEMS (All ports)
  [4] Just rebuild (don't start anything)
  [0] Exit
```

---

## 🔧 **What Each Option Does:**

### **Option 1: AI Training Platform**
```
→ Starts backend on port 8000
→ Starts frontend on port 3001
→ Opens http://localhost:3001/dashboard
→ Features: GPU training, model management, monitoring
```

### **Option 2: Agent Factory**
```
→ Starts backend on port 5000
→ Starts frontend on port 3000
→ Opens http://localhost:3000/agent-factory
→ Features: Agent creation, product catalog, operations
```

### **Option 3: BOTH SYSTEMS**
```
→ Starts all 4 services (2 backends + 2 frontends)
→ Opens both dashboards
→ Full ecosystem running
→ All features available
```

### **Option 4: Just Rebuild**
```
→ Only rebuilds, doesn't start services
→ Useful for updating dependencies
→ Start services later with START_ALL_SYSTEMS.bat
```

---

## 📝 **PowerShell Version Features:**

The PowerShell version includes:
- ✅ Progress bar with percentage
- ✅ Color-coded status messages
- ✅ Better error handling
- ✅ Step-by-step feedback
- ✅ Window titles for services
- ✅ Prettier output formatting

Example output:
```powershell
→ Setting up Python environment...
✓ Python dependencies installed
→ Installing Node.js dependencies...
✓ Frontend dependencies installed
✓ AI Training Platform rebuilt successfully!
```

---

## 🐛 **When to Use Rebuild:**

### **Use REBUILD when:**
- ✅ Fresh start needed
- ✅ Dependencies are corrupted
- ✅ Getting strange errors
- ✅ After major updates
- ✅ Node modules issues
- ✅ Python package conflicts
- ✅ "Works on my machine" syndrome

### **Don't rebuild if:**
- ❌ Services just need restart
- ❌ Simple configuration change
- ❌ Testing code changes
- ❌ Already working fine

---

## 🚨 **Troubleshooting Rebuild:**

### **Python venv creation fails:**
```powershell
# Install Python if missing
# Download from python.org
# Ensure Python 3.9+ installed
python --version
```

### **Pip install fails:**
```powershell
# Try with force reinstall
pip install -r requirements.txt --force-reinstall --no-cache-dir
```

### **Node install fails:**
```powershell
# Update npm
npm install -g npm@latest

# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### **Port conflicts:**
```powershell
# Check what's using ports
netstat -ano | findstr "3000 3001 5000 8000"

# Kill process
taskkill /PID <PID> /F
```

---

## 📦 **Disk Space Requirements:**

| Component | Space Needed |
|-----------|--------------|
| Python venv | ~500 MB |
| Python packages | ~5 GB (with PyTorch) |
| AI Platform node_modules | ~400 MB |
| Agent Factory node_modules | ~200 MB |
| Models (optional) | ~10-20 GB |
| **Total Minimum** | **~6-7 GB** |
| **Recommended** | **30+ GB free** |

---

## ⚡ **Quick Commands Reference:**

```powershell
# Full rebuild and start both
.\REBUILD_AND_RUN.ps1
# Choose option 3

# Rebuild only (no start)
.\REBUILD_AND_RUN.ps1
# Choose option 4

# Check if services running
netstat -ano | findstr "3000 3001 5000 8000"

# View Python packages
cd ai_training_platform
.\venv\Scripts\Activate.ps1
pip list

# View Node packages
cd ai_training_platform\frontend
npm list --depth=0
```

---

## 🎯 **After Rebuild Success:**

### **Verify Everything:**

```powershell
# Check Python
cd D:\LLM\ai_training_platform
.\venv\Scripts\Activate.ps1
python -c "import torch; print('GPU:', torch.cuda.is_available())"

# Check Node
cd frontend
npm list react next

# Test backend
curl http://localhost:8000/health

# Test frontend
# Open browser to http://localhost:3001/dashboard
```

---

## 🌟 **Best Practices:**

1. **Before Rebuild:**
   - Close all terminal windows
   - Stop any running services
   - Free up disk space

2. **During Rebuild:**
   - Don't interrupt the process
   - Watch for error messages
   - Wait for each phase to complete

3. **After Rebuild:**
   - Verify services start correctly
   - Check dashboards load
   - Test API endpoints

---

## 📚 **Additional Scripts:**

After successful rebuild, you can use:

```powershell
# Quick start (no rebuild)
.\START_ALL_SYSTEMS.bat

# AI Platform only
cd ai_training_platform
.\START_DEV.bat

# Agent Factory only
cd agent_factory_project
.\START_AGENT_FACTORY.bat

# Verify installation
cd ai_training_platform
python verify_installation.py
```

---

## 🎉 **Ready to Rebuild!**

### **Start Now:**

**Windows Explorer:**
1. Navigate to `D:\LLM\`
2. Double-click `REBUILD_AND_RUN.bat`
3. Wait 6-10 minutes
4. Choose what to start
5. Done!

**Command Line:**
```cmd
cd D:\LLM
REBUILD_AND_RUN.bat
```

**PowerShell:**
```powershell
cd D:\LLM
.\REBUILD_AND_RUN.ps1
```

---

## 📊 **Expected Results:**

After successful rebuild:
- ✅ Clean Python environment
- ✅ Latest dependencies installed
- ✅ All 533 Node packages (AI Platform)
- ✅ All dependencies (Agent Factory)
- ✅ Sample data created
- ✅ Directories set up
- ✅ Ready to start services

---

**The rebuild scripts will give you a fresh, clean installation every time!** 🔄

*No more "it worked yesterday" problems!*
