"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Message, Reference, ChatRequest, Conversation } from '@/types/api'
import { useConversation } from '@/hooks/use-conversations'
import { useChat, useChatHistory } from '@/hooks/use-chat'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, FileText, Info, AlertCircle, MessageSquare, HelpCircle, ArrowDown, RefreshCcw, PanelLeft } from 'lucide-react'
import Link from 'next/link'
import { useConversationStore } from '@/store/conversation-store'
import { formatDate } from '@/lib/utils'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useItemsByConversationId } from '@/hooks/use-items'
import { useQueryClient } from '@tanstack/react-query'
import { conversationsKeys } from '@/hooks/use-conversations'
import { useSidebar } from '@/components/ui/sidebar'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const conversationId = params.conversation_id as string
  const [messageInput, setMessageInput] = useState('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [useBackupTitle, setUseBackupTitle] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [conversationTitle, setConversationTitle] = useState<string>('Chat')
  const [conversationContext, setConversationContext] = useState<string | null>(null)
  const [redirectingToDashboard, setRedirectingToDashboard] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Get conversations from store
  const { selectConversation, conversations, selectedConversationId } = useConversationStore()
  
  // Try to find the conversation in the local store as a backup
  const backupConversation = conversations.find(conv => conv.id === conversationId)
  
  // Fetch conversation details
  const { 
    data: conversationData, 
    isLoading: isLoadingConversation,
    error: conversationError,
    refetch: refetchConversation,
    isError
  } = useConversation(conversationId)
  
  // Fetch chat history using the useChatHistory hook
  const { 
    data: chatHistory, 
    isLoading: isLoadingChatHistory,
    error: chatHistoryError,
    refetch: refetchChatHistory,
    isRefetching
  } = useChatHistory(conversationId)
  
  // Fetch items to check if conversation has any documents
  const {
    data: conversationItems,
    isLoading: isItemsLoading,
  } = useItemsByConversationId(conversationId)
  
  // Chat mutation for sending messages using the useChat hook
  const chatMutation = useChat()
  
  // Update title and context whenever conversation data changes
  useEffect(() => {
    if (conversationData) {
      // Use the data from the API
      setConversationTitle(conversationData?.title || backupConversation?.title || 'Chat')
      // Use a type assertion to access the context property
      const contextData = (conversationData as any).context
      setConversationContext(contextData || null)
    } else if (useBackupTitle && backupConversation) {
      // Use backup data from the store if API fails
      setConversationTitle(backupConversation.title || 'Chat')
      // Use a type assertion for the backup context as well
      const backupContextData = (backupConversation as any).context
      setConversationContext(backupContextData || null)
    }
  }, [conversationData, useBackupTitle, backupConversation])

  // Update document title when conversation title changes
  useEffect(() => {
    if (conversationTitle && conversationTitle !== 'Chat') {
      document.title = `${conversationTitle} | Chat`;
    } else {
      document.title = 'Chat';
    }
  }, [conversationTitle]);

  // Set backup title after multiple failed attempts
  useEffect(() => {
    if (conversationError && retryCount >= 2 && backupConversation) {
      setUseBackupTitle(true);
    }
  }, [conversationError, retryCount, backupConversation])

  // Auto-retry conversation data fetch on initial error
  useEffect(() => {
    let retryTimer: NodeJS.Timeout | null = null;
    
    if (conversationError && retryCount < 3 && isInitialLoad) {
      retryTimer = setTimeout(() => {
        refetchConversation();
        setRetryCount(prev => prev + 1);
      }, 2000); // Retry after 2 seconds
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [conversationError, retryCount, isInitialLoad, refetchConversation]);
  
  // Handle scrolling behavior
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Check if we're at the bottom of the container (within 20px)
      const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 20;
      
      setIsAtBottom(atBottom);
      
      // Only show scroll indicator if not at bottom and has enough messages
      const messagesCount = chatHistory?.length || 0;
      setShowScrollIndicator(messagesCount > 3 && !atBottom);
    }
  }, [chatHistory]);

  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  // Scroll to bottom when messages change, but respect user's current scroll position
  useEffect(() => {
    if (!chatHistory?.length) {
      if (!isLoadingChatHistory) {
        // If there are no messages and loading has finished, set initial load to false
        setIsInitialLoad(false);
      }
      return;
    }
    
    // Always scroll to bottom on initial load
    if (isInitialLoad) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setIsInitialLoad(false);
      }, 100);
      return;
    }
    
    // For subsequent message updates, only auto-scroll if:
    // 1. The user was already at the bottom before the update
    // 2. The user just sent a message (chatMutation was pending and now it's not)
    const isSendingComplete = !chatMutation.isPending && chatMutation.data;
    
    if (isAtBottom || isSendingComplete) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatHistory, isLoadingChatHistory, isInitialLoad, chatMutation.isPending, chatMutation.data, isAtBottom]);
  
  // Force invalidate and refetch function
  const forceRefreshConversation = async () => {
    try {
      // First invalidate the query cache
      queryClient.invalidateQueries({ 
        queryKey: conversationsKeys.detail(conversationId) 
      });
      
      // Remove the cached data
      queryClient.removeQueries({ 
        queryKey: conversationsKeys.detail(conversationId) 
      });
      
      // Then refetch
      await refetchConversation();
      
      // Also refresh history
      refetchChatHistory();
      
      toast.success("Refreshed conversation data");
    } catch (error) {
      toast.error("Failed to refresh. Please try again.");
    }
  };
  
  // Manual handler to update the title in Zustand store
  const updateTitleInStore = useCallback(() => {
    if (conversationData && conversationData.title) {
      try {
        // Since we have data from the API, update our store
        useConversationStore.getState().updateConversation(conversationId, {
          title: conversationData.title
        });
      } catch (error) {
        // Error handling without console logs
      }
    }
  }, [conversationId, conversationData]);
  
  // Call this function when conversation data changes
  useEffect(() => {
    if (conversationData) {
      updateTitleInStore();
    }
  }, [conversationData, updateTitleInStore]);
  
  // Prepare the chat request
  const prepareChatRequest = (): ChatRequest => {
    return {
      conversation_id: conversationId,
      message: messageInput.trim(),
      use_rag: true, // Enable RAG by default
      top_k: 3 // Retrieve top 3 relevant documents
    }
  }
  
  // Handle sending a message with optimistic updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || chatMutation.isPending) return
    
    const userMessage = messageInput.trim()
    setMessageInput('') // Clear input immediately
    
    // Scroll to bottom when sending a new message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setIsAtBottom(true);
    }, 50);
    
    try {
      // Prepare the request
      const chatRequest = prepareChatRequest()
      
      // Send the message using the useChat hook
      await chatMutation.mutateAsync(chatRequest)
      
      // No need to manually refetch - rely on the mutations in the hook
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    }
  }
  
  // Handle scroll to bottom - use smooth scrolling for a better experience
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
  }, [])

  // Sample conversation starters based on document types
  const getConversationStarters = () => {
    const hasDocuments = conversationItems && conversationItems.length > 0;
    const hasActiveDocuments = conversationItems?.some(item => item.active) || false;
    
    if (!hasDocuments) {
      return ["Add documents first by clicking the '+' button in the sidebar"];
    }
    
    if (!hasActiveDocuments) {
      return ["No active documents found. Activate documents in the sidebar menu to start asking questions."];
    }
    
    return [
      "Summarize the main points from my documents",
      "What are the key insights from these documents?",
      "Compare the information between these documents",
      "Extract important dates and events mentioned",
      "What action items can I identify from these materials?"
    ];
  };

  // Check if conversation exists and redirect if not found
  useEffect(() => {
    // Only check after loading has finished
    if (!isLoadingConversation && !redirectingToDashboard) {
      // Conditions to determine if conversation doesn't exist:
      // 1. API returned error AND
      // 2. No backup conversation in store AND
      // 3. Not on initial load (to allow for retries)
      const conversationNotFound = isError && !backupConversation && !isInitialLoad;
      
      // Only redirect if we've made at least one attempt to load
      if (conversationNotFound && retryCount > 0) {
        setRedirectingToDashboard(true);
        
        // Show toast message
        toast.error("Conversation not found or you don't have access to it", {
          duration: 3000,
          position: 'top-center'
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    }
  }, [
    isLoadingConversation, 
    isError, 
    backupConversation, 
    isInitialLoad, 
    retryCount, 
    redirectingToDashboard, 
    router
  ]);

  // Go back to dashboard if conversation not found after retries
  const handleBackToDashboard = () => {
    // Show toast message
    toast.info("Returning to dashboard", {
      duration: 2000,
      position: 'top-center'
    });
    
    router.push('/dashboard');
  };

  // Safe access to chat messages
  const messages = chatHistory || []
  const messagesReversed = [...messages].reverse() // Reverse message order
  const hasMessages = messages.length > 0
  const conversationStarters = getConversationStarters();

  const { toggleSidebar } = useSidebar()

  // Show loading state during initial load
  if ((isLoadingConversation || isLoadingChatHistory) && isInitialLoad) {
    return (
      <div className="flex h-screen bg-gray-50 w-full">
        <ChatSidebar conversationId={conversationId} conversationTitle={conversationTitle} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <LoadingSpinner className="text-gray-700 h-8 w-8 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Loading conversation</h3>
            <p className="text-gray-500 max-w-md">
              Retrieving your chat history and preparing your documents...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if both chat history and conversation fetching failed
  if ((conversationError && chatHistoryError) || (conversationError && retryCount >= 3 && !backupConversation)) {
    return (
      <div className="flex h-screen bg-gray-50 w-full">
        <ChatSidebar conversationId={conversationId} conversationTitle={conversationTitle} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Error Loading Conversation</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{conversationError?.message || chatHistoryError?.message || 'Failed to load conversation data.'}</p>
              <p>The conversation may have been deleted or you might not have access to it.</p>
            </AlertDescription>
          </Alert>
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={forceRefreshConversation} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button 
              variant="outline"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 w-full text-gray-900">
      {/* Chat Sidebar component */}
      <ChatSidebar conversationId={conversationId} conversationTitle={conversationTitle} />
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full w-full max-w-[calc(100%-20rem)]">
        {/* Chat header - enhanced top bar */}
        <div className="py-3 px-5 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 w-full max-w-[70%]">
              {/* Mobile sidebar toggle - only visible on mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-500 hover:text-gray-900"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
              
              {isLoadingConversation && !useBackupTitle ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">
                    {conversationTitle}
                  </h1>
                  {/* Display conversation context if available */}
                  {conversationContext && (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {conversationContext}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {conversationError && !isLoadingConversation && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={forceRefreshConversation}
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  <span className="text-xs">Refresh</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <Link href={`/dashboard?folder=${conversationId}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  View in Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Messages container */}
        <ScrollArea 
          className="flex-1 bg-gray-50 relative" 
          ref={scrollContainerRef}
        >
          <div className="p-4 space-y-6">
            {isLoadingChatHistory || isRefetching ? (
              // Show skeleton loading for messages
              Array(3).fill(0).map((_, index) => (
                <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <Skeleton className={`h-24 ${index % 2 === 0 ? 'w-2/3' : 'w-1/2'} rounded-lg`} />
                </div>
              ))
            ) : hasMessages ? (
              messagesReversed.map((message: Message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Document references */}
                      {message.role === 'assistant' && message.references && message.references.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold flex items-center mb-2 text-gray-700">
                            <Info className="h-3 w-3 mr-1" />
                            References
                          </p>
                          <div className="space-y-2">
                            {message.references.map((reference: Reference, idx: number) => (
                              <div key={idx} className="text-xs p-2 bg-gray-100 rounded">
                                <div className="font-medium text-gray-700">{reference.file_name}</div>
                                <div className="mt-1 text-gray-600 line-clamp-2">
                                  {reference.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Message timestamp */}
                      <div className="text-xs mt-1 text-right opacity-70">
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : chatHistoryError ? (
              <div className="flex flex-col items-center justify-center h-[40vh] text-center p-4">
                <Alert variant="destructive" className="max-w-md mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertTitle>Error Loading Messages</AlertTitle>
                  <AlertDescription>
                    {chatHistoryError.message || 'Could not load chat messages. Please try refreshing.'}
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => refetchChatHistory()}
                  className="mt-2"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh Messages
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                <div className="bg-white rounded-xl p-6 shadow-sm max-w-md w-full">
                  <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Start a new conversation</h3>
                  <p className="text-gray-600 mb-6">
                    Ask questions about your documents to get insights and information.
                  </p>
                  
                  {conversationStarters.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Try asking:
                      </h4>
                      <div className="space-y-2">
                        {conversationStarters.map((starter, idx) => (
                          <div 
                            key={idx}
                            className="p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 cursor-pointer transition-colors"
                            onClick={() => setMessageInput(starter)}
                          >
                            {starter}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Show a loading indicator when sending a message */}
            {chatMutation.isPending && (
              <div className="flex justify-start mt-4">
                <div className="bg-white text-gray-900 shadow-sm rounded-lg p-4 flex items-center space-x-2">
                  <LoadingSpinner className="h-4 w-4 text-gray-700" />
                  <p className="text-sm text-gray-500">Generating response...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Scroll indicator */}
          {showScrollIndicator && (
            <button 
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 bg-white shadow-md rounded-full p-3 hover:bg-gray-100 transition-colors"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </ScrollArea>
        
        {/* Input area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="resize-none min-h-[80px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                disabled={chatMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={chatMutation.isPending || !messageInput.trim()}
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {chatMutation.isPending ? <LoadingSpinner className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 