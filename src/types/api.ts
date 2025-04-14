// Common types
export interface ValidationError {
    loc: (string | number)[]
    msg: string
    type: string
}

export interface HTTPValidationError {
    detail: ValidationError[]
}

// Item types
export interface Item {
    id: string
    file_name: string
    mime_type: string
    size: number
    created_at: string
    updated_at: string
    active: boolean
    conversation_id?: string
    user_id: string
}

export interface ItemUpdate {
    file_name?: string | null
    active?: boolean | null
}

export interface ItemsResponse {
    items: Item[]
    total: number
}

export interface ItemResponse {
    item: Item
}

// Conversation types
export interface Conversation {
    id: string
    title: string
    context: string
    created_at: string
    updated_at: string
    user_id: string
}

export interface ConversationCreate {
    title: string
    context: string
}

export interface ConversationsResponse {
    conversations: Conversation[]
    total: number
}

export interface ConversationResponse {
    conversation: Conversation
}

// Chat types
export interface ChatRequest {
    conversation_id: string
    message: string
    use_rag?: boolean
    top_k?: number
}

export interface Message {
    id: string
    conversation_id: string
    content: string
    role: "user" | "assistant" | "system"
    created_at: string
    references?: Reference[]
}

export interface Reference {
    item_id: string
    file_name: string
    content: string
    score: number
}

export interface ChatResponse {
    message: Message
}

export interface ChatHistoryResponse {
    messages: Message[]
    total: number
}

// Upload types
export interface DriveUrl {
    url: string
    conversation_id?: string
}

export interface UploadResponse {
    item_id: string
    file_name: string
    mime_type: string
    size: number
}

// Health check
export interface HealthResponse {
    status: string
}

