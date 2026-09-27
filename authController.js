const Member = require('./Member');
const User = require('./User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req,res)=>{
  try{
    const user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).json({msg:"User not found"});

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if(!isMatch) return res.status(400).json({msg:"Wrong password"});

    // Auto add to Members if not exists - YOUR DEMAND
    let member = await Member.findOne({email:user.email});
    if(!member){
      member = await Member.create({
        name: user.name,
        email: user.email,
        userId: user._id,
        joinDate: new Date(),
        loginCount: 1,
        lastLogin: new Date(),
        booksIssued: []
      });
    } else {
      member.loginCount += 1;
      member.lastLogin = new Date();
      await member.save();
    }

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'1d'});
    res.json({token, user, member});

  }catch(err){
    res.status(500).json({error:err.message});
  }
}