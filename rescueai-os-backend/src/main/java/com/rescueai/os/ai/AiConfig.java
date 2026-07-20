package com.rescueai.os.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Selects which underlying ChatModel backs the platform's single ChatClient,
 * driven entirely by `rescueai.ai.provider` in application.yml (or the
 * AI_PROVIDER env var). This is the literal implementation of the roadmap
 * promise: "Gemini today -> Gemma/Llama/Mistral/DeepSeek/Phi locally tomorrow"
 * is a one-line config change, not a rewrite of any Agent class.
 *
 *   rescueai.ai.provider=openai  -> uses spring.ai.openai.* config
 *                                   (point base-url at Gemini's OpenAI-compatible
 *                                   endpoint, or at OpenAI directly)
 *   rescueai.ai.provider=ollama  -> uses spring.ai.ollama.* config, talking to a
 *                                   locally-hosted open-weight model
 */
@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(
            @Value("${rescueai.ai.provider:openai}") String provider,
            @Qualifier("openAiChatModel") ChatModel openAiChatModel,
            @Qualifier("ollamaChatModel") ChatModel ollamaChatModel) {

        ChatModel selected = "ollama".equalsIgnoreCase(provider) ? ollamaChatModel : openAiChatModel;
        return ChatClient.builder(selected).build();
    }
}
