package com.rescueai.os.ai;

/**
 * Provider-agnostic contract every agent talks to. Swap the implementation bean
 * (Gemini today, a self-hosted Llama/Mistral/Gemma via Ollama tomorrow) and
 * NOT ONE agent class needs to change. This is the seam that makes Phase 2
 * ("run open-weight models locally") a config change, not a rewrite.
 */
public interface LlmClient {

    /**
     * @param systemPrompt role/behavior instructions for the agent
     * @param userPrompt   the actual task input (incident text, structured JSON, etc.)
     * @return raw model text response (agents are responsible for parsing structured output)
     */
    String complete(String systemPrompt, String userPrompt);
}
