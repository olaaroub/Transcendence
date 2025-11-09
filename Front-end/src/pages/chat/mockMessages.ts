
export type Message = {
	id: string;
	senderId: string;
	senderName: string;
	avatar: string;
	content: string;
	timestamp: string;
	isMine: boolean;
};

export const mockMessages: Message[] = [
{
	id: "1",
	senderId: "u1",
	senderName: "mmondad",
	avatar: "/images/mmondad.jpeg",
	content: "Yo, wach ready l tournament dyal lyoum?",
	timestamp: "2025-10-18T09:40:00Z",
	isMine: false,
},
{
	id: "2",
	senderId: "u2",
	senderName: "ohammou",
	avatar: "/images/ohammou-.jpeg",
	content: "Ayeee, rah dert warm-up mn sbah 🔥",
	timestamp: "2025-10-18T09:41:10Z",
	isMine: true,
},
{
	id: "3",
	senderId: "u1",
	senderName: "hes-safi",
	avatar: "/images/hes-safi.jpeg",
	content: "Nice! ana mazal kan setup stream",
	timestamp: "2025-10-18T09:42:30Z",
	isMine: false,
},
{
	id: "4",
	senderId: "u3",
	senderName: "olaaroub",
	avatar: "/images/olaaroub.jpeg",
	content: "Ma tnsawch ndir screenshot mn match lwal 😎",
	timestamp: "2025-10-18T09:43:55Z",
	isMine: false,
},
{
	id: "5",
	senderId: "u2",
	senderName: "oumondad",
	avatar: "/images/oumondad.jpeg",
	content: "Of course 😂 ana ghadi ndir montage b stats",
	timestamp: "2025-10-18T09:45:12Z",
	isMine: true,
},
{
	id: "6",
	senderId: "u3",
	senderName: "mmondad",
	avatar: "/images/mmondad.jpeg",
	content: "Perfect! btw hadchi ghadi ykoun streamed?",
	timestamp: "2025-10-18T09:46:40Z",
	isMine: false,
},
{
	id: "7",
	senderId: "u2",
	senderName: "Mohamed",
	avatar: "/images/mmondad.jpeg",
	content: "Yes, twitch.tv/ft_pong 😏",
	timestamp: "2025-10-18T09:47:22Z",
	isMine: true,
},
];
