> Tiny data for the web.

Data transfer between web browser and server are usually done with JSON data, which is in text format. This library helps to create a simple binary format that can be sent/received to/from server. The main advantage of data transfer using binary format is the size.

EzMsg aims to be used as the data transfer for web application, replacing JSON data.

# Why?
- It is tiny.

# Supported Languages
- [Javascript](ezmsg-js/README.md) (web and node)
- More languages are planned.

# Installation and Usage
[Please go to the site for documentation](https://libezmsg.netlify.com/).

# FAQ
**Q: Why not just use Protobuf?**  
A: Protobuf is great, and EzMsg is actually inspired by Protobuf. With Protobuf, you get a consistent contract for schema across all languages using .proto file, while EzMsg depends on user not making mistake in defining the types (xD). Honestly, **Protobuf is better**. The only things that EzMsg is better at are the size, focus on web application, and easiness to install and use.

**Q: What about lightweight alternatives like FlatBuffers or Capt'n Proto?**  
A: Just like Protobuf, I think they are better. Definitely use them if they are what you need. EzMsg is still more lightweight, focused on web application, and easier to use (no compilation step).

**Q: What about [MessagePack](https://msgpack.org/)?**  
A: Honestly, I only know about MessagePack recently while writing this library. MessagePack doesn't need a schema for encoding and decoding, which make it even easier to use than EzMsg. It is also very compact and optimized for size. However, it includes object keys in the resulting buffer. So the resulting buffer for EzMsg should still be smaller with big objects.

**Q: What are the differences between this and [BufferTable](https://github.com/harchcode/buffertable)?**  
A: Well, that BufferTable was supposed to be optimized for parsing (very little parsing when deserializing), but slower at manipulating data. But seeing that the target is for data transfer between web application and API, I think it is better to just parse all the data whenever it is received, just like how we use JSON data. This also make it easier to develop EzMsg, and resulting size is also smaller. And I will deprecate BufferTable soon.

**Q: I tried to run the benchmark, and it turns out this is slower (about 3x-6x slower) than using JSON.parse and JSON.stringify?**  
A: The main advantages of data transfer using binary is the size. Depending on the data, binary data size can be much smaller than text data size like JSON. While the JSON is faster in JS, we won't be sure for other languages. Also, although it is slower than JSON, doesn't mean it is slow. It is still very fast, and you won't notice the difference at all in actual use.

**Q: Why separate the web package and Node package? The web version can work on both browser and Node!**  
A: NodeJs has a built-in `Buffer` object. I tried to use it and it turns out it is faster than the web version. So you should use the Node version for Node.

**Q: Why the web version is slower than Node version?**  
A: Well, I don't know. Maybe the `Buffer` object in Node is more optimized.

# How to Contribute
_coming soon_