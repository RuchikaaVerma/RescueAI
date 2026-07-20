package com.rescueai.os.ai.impl;

import com.rescueai.os.ai.LlmClient;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

/**
 * Default LlmClient backed by Spring AI's ChatClient. The ChatClient bean itself is
 * built from whichever ChatModel is on the classpath/active in application.yml
 * (OpenAI-compatible endpoint for Gemini, or Ollama for local Llama/Mistral/Gemma/Phi/DeepSeek).
 * Agents never import a provider-specific class — only this.
 */
@Component
public class SpringAiLlmClient implements LlmClient {

    private final ChatClient chatClient;

    public SpringAiLlmClient(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        return chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();
    }
}
