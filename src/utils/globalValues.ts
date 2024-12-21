class ReturnData {
  message: string;
  error: string;
  value: any;
}

class PostData {
  data: any;
  comments: number;
}

class MailData {
  from: string;
  to: string;
  subject: string;
  text: string;
}

function midGround(prev: number, next: number) {
  return prev + (next - prev) / 2;
}

export { ReturnData, MailData, PostData, midGround };
