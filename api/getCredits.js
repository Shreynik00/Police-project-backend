import neon from "@neondatanase/serverless"

export  default  async function Handler( req ,res)
{
    //CORS
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS");
    res.setHeader("Acces- Control-Allow-Headers","Content-Type , Autthorization");
      res.setHeader("Access-Control-Max-Age", "86400");
    
    //prefligth request handler
    if(req.method == "OPTIONs")
    {
        return res.status(200).end();

    }
    if(req.method == "POST")
{
  return res.status(404).json({message :"method not Allowed"});
}

    try{
        const { username } = req.body;

        if(!username)
        {
            return res.status(400).json({message :"username is required"});
        }
        const sqldb = neon(process.env.DTABASR_URL);
        const credit = await sql` 
        SELECT  credits FROM users WHERE username = ${username}`

          if (credit.length === 0)
        return res
          .status(401)
          .json({ success: false, message: "User not found" });

          return res.status(200).json({ credit:credit[0].credits});

    }
    
    catch(error)
    {
        console.error("Error fetching credits:",error);
        return res.status(500).json({message :"Internal Server Error"});
    }
}
