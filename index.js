const express = require('express'),
cors = require('cors'),
app = express(),
PORT = process.env.PORT || 5000,
router = require('./routes/router'),
bodyParser  = require('body-parser'),
morgan = require('morgan'),
Sentry = require('@sentry/node'),
{ ProfilingIntegration } = require('@sentry/profiling-node'),
http = require('http').Server(app),
io = require('socket.io')(http);
 
require('dotenv').config()

Sentry.init({
    dsn: 'https://d5fc9aab4756429325379c854dd518d9@o4506235500822528.ingest.sentry.io/4506235503837184',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
  
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(morgan('combined'))
app.use(cors());
app.use(express.json({strict: false}));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.urlencoded({extended:false})); 
app.use('/api/v1', router) // Grupkan API
app.use(Sentry.Handlers.errorHandler());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('sendWelcomeNotification', (data) => {
    io.emit('welcomeNotification', { message: 'Welcome to our platform!' });
  });
  socket.on('updatePassword', (data) => {
    io.emit('passwordUpdated', { message: 'Your password has been updated!' });
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})

