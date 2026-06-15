<?php

namespace App\Modules\Chat\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    /**
     * Get or create a chat for a specific order.
     */
    public function getOrCreateChat(Request $request, Order $order)
    {
        // Enforce authorization: user must be the customer who placed the order or an admin
        // (In a real app, shop owners of items in the order would also be allowed)
        if ($request->user()->role !== 'admin' && $order->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized to access this chat.'], 403);
        }

        $chat = Chat::firstOrCreate(['order_id' => $order->id]);

        $chat->load(['messages.sender', 'order']);

        return response()->json($chat);
    }

    /**
     * Send a message in a specific chat.
     */
    public function sendMessage(Request $request, Chat $chat)
    {
        // Enforce authorization
        $order = $chat->order;
        if ($request->user()->role !== 'admin' && $order->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized to send messages in this chat.'], 403);
        }

        $validated = $request->validate([
            'message' => 'required_without:attachment|nullable|string',
            'attachment' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('chat_attachments', 'public');
            $attachmentPath = Storage::url($path);
        }

        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $request->user()->id,
            'message' => $validated['message'] ?? null,
            'attachment_path' => $attachmentPath
        ]);

        return response()->json($message->load('sender'), 201);
    }
}
