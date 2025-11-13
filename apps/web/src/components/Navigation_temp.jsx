            <a  
              href="/agents"  
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${  
                location.pathname === '/agents'  
                  ? 'bg-white bg-opacity-20 text-white'  
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'  
              }`}  
            >  
              <Bot className="h-5 w-5" />  
              <span>AI Agents</span>  
            </a> 
