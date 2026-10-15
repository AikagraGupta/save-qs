export async function startVoice(agentId, tools, callbacks, summary, textOnly=false) {
 const {Conversation}=await import('@elevenlabs/client');
 const session=await Conversation.startSession({agentId,connectionType:'websocket',textOnly,clientTools:tools,...callbacks});
 session.sendContextualUpdate(`Current SAVE project summary (call tools for fresh data): ${JSON.stringify(summary)}`);
 return session;
}
