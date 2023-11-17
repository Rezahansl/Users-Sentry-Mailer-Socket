const { users} = require('../models'),
        Sentry = require('@sentry/node'),
        hash = require('../utils/hash'),
        token = require('../utils/token'),
        bcrypt = require('bcrypt');
        jwt = require('jsonwebtoken'),
        nodemailer = require('nodemailer');
const secret_key = process.env.JWT_KEY || 'no_secret'

module.exports = {
  register: async (req, res, next) => {
    try {
      const { firstname, lastname, email, password, phone, gender, date_of_birth } = req.body;

      const reset_token = token.generateResetToken();
      const hashedPassword = await hash.cryptPassword(password);
      
      const newUser = await users.create({
        data: {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          phone,
          gender,
          date_of_birth,
          reset_token,
        },
      });

      return res.render('register-success');
    } catch (error) {
      Sentry.captureException(error); 
        return res.status(500).json({
            error
        });
    }
  },

  login: async (req, res, next) => {
    try {
        const findUser = await users.findFirst({
            where: {
                email: req.body.email
            }
        });
        
        if (!findUser) {
            return res.render('error');
        }
        if (bcrypt.compareSync(req.body.password, findUser.password)) {
            let welcomeMessage = `WELCOME ${findUser.email}`;
            const token = jwt.sign({ id: findUser.id }, secret_key, { expiresIn: '6h' });

            return res.render('login-success');
        }
        return res.status(403).json({
            error: 'Invalid credentials'
        });
        
    } catch (error) {
      Sentry.captureException(error); 
        return res.status(500).json({
            error
        });
    }
},
    forgotPassword: async (req, res) => {
        try {
          const { email } = req.body;
    
          const user = await users.findFirst({
            where: {
              email: email,
            },
          });
    
          if (!user) {
            return res.render('error');
          }
    
          const resetToken = token.generateResetToken();
          await users.update({
            where: {
              id: user.id,
            },
            data: {
              reset_token: resetToken,
            },
          });
          const transporter = nodemailer.createTransport({
            pool: true,
            host: 'smtp.gmail.com', 
            port: 465,
            secure: true, // Menggunakan SSL/TLS
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
            
          });
    
          const resetPasswordLink = `http://localhost:5000/api/v1/users/reset-password/${resetToken}`;
          const mailOptions = {
            from: 'hanhans3000@gmail.com',
            to: user.email,
            subject: 'Reset Your Password',
            html: `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`,
          };
          
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.render('error');
            }
            console.log('Email sent: ' + info.response);
          });
          return res.render('forgot-password-success');
        } catch (error) {
          Sentry.captureException(error); 
          return res.status(500).json({
            error: 'Internal Server Error',
          });
        }
      },
    
      resetPassword: async (req, res) => {
        try {
          
          const { token } = req.params;
          const { newPassword } = req.body;
      
          // Temukan pengguna berdasarkan reset_token
          const user = await users.findFirst({
            where: {
              reset_token: token,
            },
          });
      
          if (!user) {
            return res.render('error');
          }
          const hashedPassword = await hash.cryptPassword(newPassword);
      
          // Update password dan hapus reset_token
          await users.update({
            where: {
              id: user.id,
            },
            data: {
              password: hashedPassword,
              reset_token: null,
            },
          });
          return res.render('reset-password-success');
        } catch (error) {
          Sentry.captureException(error); 
          return res.status(500).json({
            error: 'Internal Server Error',
          });
        }
      },
      
};

