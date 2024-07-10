const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const bodyParser = require('body-parser');
// const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const UserInfo = require("./db/userInfoModel");
const Product = require("./db/productModel");
const Conversation = require("./db/conversationModel");
const History = require("./db/chatHistoryModel");
const Chroma = require("./db/chromaHistoryModel");
const auth = require("./auth");

const { MongoClient, ObjectId } = require('mongodb');
// const cookiesMiddleware = require('universal-cookie-express');
const Cookies = require('universal-cookie'); 
const cors = require('cors');
// body parser configuration

// app.use(cookiesMiddleware()).use(function (req, res) {
//   // get the user cookies using universal-cookie
//   req.universalCookies.get('token');
// });

//deConnect();
const mongoose = require("mongoose");
require('dotenv').config()

mongoose.connect(
            process.env.DB_URL,
            {
            //   these are options to ensure that the connection is done properly
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        }   
    )
    
    .then((db) => {
        console.log("Successfully connected to MongoDB Atlas!");

        // async function createModel() {
        //   const inferredSchema = await mongoose.Schema.interpretAsSchema(db.Collection('chat_history'));
        // const Model = mongoose.model('Model', inferredSchema);
        // }
        
        // createModel();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.get("/", (request, response, next) => {
          response.json({ message: "Hey! This is your server response!" });
          next();
        });

        // Curb Cores Error by adding a header here
        app.use((req, res, next) => {
          // res.setHeader("Access-Control-Allow-Origin", "http://localhost:5678");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
          );
          res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, PATCH, OPTIONS"
          );
          cookies = new Cookies(req.headers.cookie);
          console.log("Cookies:", cookies.get('token'));
          next();
        });



        app.post("/register", async (request, response) => {
          try {
              // hash the password
              let hashedPassword = await bcrypt.hash(request.body.password, 10);
              // create a new user instance and collect the data
              const user = new User({
                  email: request.body.email,
                  password: hashedPassword,
              });
              // save the new user
              try {
                  let result = await user.save();
                  // return success if the new user is added to the database successfully
                  response.status(201).send({
                      message: "User Created Successfully",
                      result,
                  });
              } catch (error) {
                  // catch error if the new user wasn't added successfully to the database
                  response.status(500).send({
                      message: "Error creating user",
                      error,
                  });
              }
          } catch (error) {
              // catch error if the password hash isn't successful
              response.status(500).send({
                  message: "Password was not hashed successfully",
                  error,
              });
          }
        });

        app.post("/login", (request, response) => {
          User.findOne({ email: request.body.email })
          .then((user) => {
            bcrypt.compare(request.body.password, user.password)
            .then((passwordCheck) => {

              // check if password matches
              if(!passwordCheck) {
                return response.status(400).send({
                  message: "Passwords does not match",
                  error,
                });
              }

              //   create JWT token
              const token = jwt.sign(
                {
                  userId: user._id,
                  userEmail: user.email,
                },
                "RANDOM-TOKEN",
                { expiresIn: "24h" }
              );

              // // add token to user
                User.findOne({ email: user.email })
                .then((user) => {
                  user.token = token;
                  user.save();
                }) 

              //   return success response
                response.status(200).send({
                message: "Login Successful",
                email: user.email,
                token,
              });
            })

            .catch((error) => {
              response.status(400).send({
                message: "Passwords does not match",
                error,
              });
            })
          })
          .catch((e) => {
            response.status(404).send({
              message: "Email not found",
              e,
            });
          })
        })


        // free endpoint
        app.get("/free-endpoint", (request, response) => {
          response.json({ message: "You are free to access me anytime" });
        });

        // authentication endpoint
        app.get("/auth-endpoint",auth, (request, response) => {
          response.json({ message: "You are authorized to access me" });
        });

        // get interest
        app.all("/get-interest", (request, response) => {
          UserInfo.findOne({ email: request.body.email })
            .then((user) => {
              response.json({ message: user.interest });
            }) 
        })

        // insert new conversation id for user
        app.post("/new-conversation", (request, response) => {
          // create a new user instance and collect the data
          User.findOne({ email: request.body.email })
            .then((user) => {
              user.conversationID_list.push(request.body.conversationID);
              user.save();
              response.json({ message: "ConversationID added" });
            }) 

          const conversation = new Conversation({
            conversation_id: request.body.conversationID,
            conversation_name: request.body.conversationName,
            model: request.body.model,
            temperature: request.body.temperature,
            system_msg: request.body.systemMsg,
          });
          conversation.save();
        })

        // update conversation name
        app.post("/update-conversation-name", (request, response) => {
          Conversation.findOne({ conversation_id: request.body.conversationID })
            .then((conversation) => {
              if (conversation != null)
              {
                conversation.conversation_name = request.body.conversationName;
                conversation.save();
                response.json({ message: "Conversation name updated" });
              }
              else
              {
                response.json({ message: "Conversation not created" });
              }
            }) 
        })

        // delete conversation
        app.post("/delete-conversation", (request, response) => {
          User.findOne({ conversationID_list: { "$in": [request.body.conversationID]} })
            .then((user) => {
              user.conversationID_list.pull(request.body.conversationID);
              user.save();
            }) 

          Conversation.deleteOne({ conversation_id: request.body.conversationID })
            .then(() => {
              // response.json({ message: "Conversation deleted" });
            })
          
          History.deleteMany({ SessionId: request.body.conversationID })
            .then(() => {
              response.json({ message: "Conversation deleted" });
            })
        })

        // delete all conversations of a user
        app.post("/delete-all-conversation", async(request, response) => {
          // const all_messages = await History.find({ SessionId: current_conversation });
          const user = await User.findOne({ email: request.body.email });

          let converesation_list_length = user.conversationID_list.length;
          for (let i = converesation_list_length - 1; i >= 0; i--) {

            const conversation = await Conversation.deleteOne({ conversation_id: user.conversationID_list[i] })
            const history = await History.deleteMany({ SessionId: user.conversationID_list[i] })

            await user.conversationID_list.pull(user.conversationID_list[i]);
          }
          await user.save();

          await response.json({ message: "Conversation deleted" });

        })

        // get all conversation ID for user
        app.post("/get-all-conversation", (request, response) => {
          // create a new user instance and collect the data
          User.findOne({ email: request.body.email })
            .then((user) => {
              response.json({ message: user.conversationID_list });
            }) 
        })

        // save memory
        app.post("/save-memory", (request, response) => {
          Memory.findOne({ agent_id: request.body.agent_id })
            .then((mem) => {
              mem.memory = request.body.memory;
              mem.save();
              response.json({ message: "Message saved" });
            }) 
        })

        // return memory
        app.all("/return-memory", (request, response) => {
          Memory.findOne({ agent_id: request.body.agent_id })
            .then((memory) => {
              response.json({ message: memory.memory });
            }) 
        })

        // return 3 related products to a user
        app.post("/lifepal-products", (request, response) => {
          UserInfo.findOne({ email: request.body.email })
            .then((user) => {
              Product.find({ interest: user.interest }).limit(3)
              .then(related_product => {
                response.json({
                  products: related_product 
                });
              })
            }) 
        })

        // app.post("/chroma", (request, response) => {
        //   const document = {
        //     vertor: [
        //       {file_name: "hello", file_id: "5"},
        //       {file_name: "world", file_id: "3"},
        //       {file_name: "foo", file_id: "1"},
        //       {file_name: "bar", file_id: "7"}
        //     ]
        //   };

        //   const chroma = new Chroma({
        //     email: "panda@gmail.com",
        //     vector: [
        //       {file_name: "hello", file_id: "5"},
        //       {file_name: "world", file_id: "3"},
        //       {file_name: "foo", file_id: "1"},
        //       {file_name: "bar", file_id: "7"}
        //     ]
        //   });

        //   chroma.save();
        // })



        // app.use(cors()); 

        // load all conversations of a user
        app.post("/load-conversations", async(request, response) => {
          // const inferredSchema = await mongoose.Schema.interpretAsSchema(db.Collection('chat_history')); 
          // const Model = mongoose.model('Model', inferredSchema);

          try
          {
            const user = await User.findOne({ email: request.body.email })

            const historyJson = []

            for (let i = 0; i < user.conversationID_list.length; i++) {
              var current_conversation = user.conversationID_list[i];
              // console.log("Current ID:",i,  current_conversation);

              const conversation = await Conversation.findOne({ conversation_id: current_conversation })
              // console.log("Current conversation:", conversation); 

              // Connect to MongoDB with  MongoClient
              // const client = new MongoClient(process.env.DB_URL);
              // await client.connect();
              // const db = client.db('langchain');
              // const collection = db.collection('chat_history');

              const all_messages = await History.find({ SessionId: current_conversation });

              // const schema = new mongoose.Schema({}, {
              //   collection: 'chat_history' 
              // });
              
              // const Chat = mongoose.model('Chat', schema);
              
              // let a = Chat.collection; 

              // load all messages of the current conversation
              // let a = db.Collection('chat_history')
              // a.Promise = global.Promise;
              // let a = db.Collection('chat_history').find({ SessionId: current_conversation });
              
              var messageJson = []
              var message = {}

              for (let i=0; i<all_messages.length; i++) {
                // console.log("All messages:", i , all_messages[i]);
                // console.log("All messages:", i , all_messages[i].SessionId);
                // console.log("all_messages[i].History['type']:", i, JSON.parse(all_messages[i].History)['type'])
                // console.log("all_messages[i].History['data']:", i ,all_messages[i].History["data"])
                if (JSON.parse(all_messages[i].History)['type'] == "human")
                {
                  message = {
                    "role": "user",
                    "content": "{\"text\":\"" + JSON.parse(all_messages[i].History)['data']['content'] + "\",\"image\":null}"
                  };
                }
                else if (JSON.parse(all_messages[i].History)['type'] == "ai")
                {
                  message = {
                    "role": "assistant",
                    "content": "{\"text\":\"" + JSON.parse(all_messages[i].History)['data']['content'] + "\",\"image\":null}"
                  };
                }

                messageJson.push(message);
                // console.log("message:",  message);
              }

              // console.log("messageJson:",  messageJson);
              const tempJson = {
                id: conversation.conversation_id,
                name: conversation.conversation_name,
                messages: messageJson,
                // messages: [],
                model: {
                  id: conversation.model,
                  name: conversation.model,
                  maxLength: conversation.maxLength,
                  tokenLimit: conversation.tokenLimit,
                },
                prompt: conversation.system_msg,
                temperature: parseFloat(conversation.temperature.toString()),
                folderId: null
              }; 

              historyJson.push(tempJson);
            }
            // console.log("History:", historyJson);
            const customJson = {
              version: 4,
              history: historyJson,
              folders: [],
              prompts: [],
            }; 
            console.log("customJson:", customJson);
            response.json(customJson);
          }
          catch(error)
          {
            console.log("Load Converations error (can be ignored):", error);
          }

          
        })


    })
    .catch((error) => {
        console.log("Unable to connect to MongoDB Atlas!");
        console.error(error);
    });

module.exports = app;
