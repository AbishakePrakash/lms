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

export { ReturnData, MailData, PostData };
