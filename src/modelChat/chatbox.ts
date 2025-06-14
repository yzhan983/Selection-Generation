import {getChatResponse, initilizeLLM} from "./apiConnector.ts";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

const chatHistoryList: Element = document.querySelector('#chat-history')!;
const chatInputField: HTMLInputElement = document.querySelector('#llm-chat-input')!;
const chatSubmitButton: HTMLButtonElement = document.querySelector('#llm-chat-submit')!;

const chatHistory: BaseMessage[] = [];

initilizeLLM(chatHistory).then(() => {console.log(chatHistory)});

document.querySelector('#llm-chat-form')!.addEventListener('submit', async function (event) {
    event.preventDefault();

    const userInputField: HTMLInputElement = document.querySelector('#llm-chat-input')!;
    var userMessage = userInputField.value.trim();
    if (!userMessage) return;
    userInputField.value = '';

    addChatMessage(new HumanMessage(userMessage));

    document.dispatchEvent(new CustomEvent("chatResponseStart"));
    let botResponseEntry: string;
    
    try {
        botResponseEntry = await getChatResponse(chatHistory);
        addChatMessage(new AIMessage(botResponseEntry));
    }catch (exception){
        const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
        addChatMessage(new AIMessage("Error: " + errorMessage));
    } finally {
        document.dispatchEvent(new CustomEvent("chatResponseEnd"));
    }
    
});

/*
export function addChatMessage(chatMessage: BaseMessage): HTMLLIElement {
    //Add message to history
    chatHistory.push(chatMessage);
    
    //display user message in chat box
    const messageItem = document.createElement('li');
    messageItem.innerHTML = `<strong>${chatMessage.getType().toString().toLocaleUpperCase()}:</strong> ${chatMessage.content}`;
    messageItem.style.marginBottom = '10px';
    chatHistoryList.appendChild(messageItem);
    return messageItem;
}
*/

export function addChatMessage(chatMessage: BaseMessage): HTMLLIElement {
    const li   = document.createElement('li');
    const tag  = document.createElement('span');
    const text = document.createElement('p');
  
    text.textContent = chatMessage.content as string;
  
    if (chatMessage._getType() === 'human') {
      li.className  = 'chat-user';
      tag.className = 'tag tag-user';
      tag.textContent = 'You';
    } else {
      li.className  = 'chat-ai';
      tag.className = 'tag tag-ai';
      tag.textContent = 'AI';
    }
  
    li.appendChild(tag);
    li.appendChild(text);
  
    chatHistory.push(chatMessage);
    chatHistoryList.appendChild(li);
    return li;
  }
  
  


//Detect if something modified the chat box and scroll to the bottom
const observer = new MutationObserver(() => {
    chatHistoryList.scrollTop = chatHistoryList.scrollHeight;
});

observer.observe(chatHistoryList, { childList: true, subtree: true, attributes: true, characterData: true });

// don't allow users to send messages while the bot is responding
document.addEventListener('chatResponseStart', () => {
    chatInputField.disabled = true;
    chatSubmitButton.disabled = true;
    chatInputField.value = "Thinking..."
});

document.addEventListener('chatResponseEnd', () => {
    chatInputField.disabled = false;
    chatSubmitButton.disabled = false;
    chatInputField.value = '';
    chatInputField.focus();
});

export async function sendSystemMessage(message: string): Promise<void> {
    const systemMessage = new HumanMessage(message);

    document.dispatchEvent(new CustomEvent("chatResponseStart"));
    let botResponseEntry: string;
    try {
        botResponseEntry = await getChatResponse([...chatHistory, systemMessage]);
        addChatMessage(new AIMessage(botResponseEntry));
    } catch (exception) {
        const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
        addChatMessage(new AIMessage("Error: " + errorMessage));
    } finally {
        document.dispatchEvent(new CustomEvent("chatResponseEnd"));
    }
}

