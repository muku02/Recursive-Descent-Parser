//import fs from 'fs';

//console.log(fileContents);

class Parser {
    constructor(tokens) {
      this._tokens = tokens;
      this._index = 0;
      this.tok = this._nextToken(); //lookahead
    }
  
    //wrapper used for crude  error recovery
    parse() {
      try {
        let result = this.parseLo();
        if (!this.peek("EOF")) {
          const msg = `expecting end-of-input at "${this.tok.lexeme}"`;
          throw new SyntaxError(msg);
        }
        return result;
      } catch (err) {
        exit(1)
        console.log("error");
        return err;
      }
    }
  
    peek(kind) {
      return this.tok.kind === kind;
    }
  
    consume(kind) {
      if (this.peek(kind)) {
        this.tok = this._nextToken();
      } else {
        exit(1)
        const msg = `expecting ${kind} at "${this.tok.lexeme}"`;
  
        throw new SyntaxError(msg);
        
      }
    }
  
    _nextToken() {
      if (this._index < this._tokens.length) {
        return this._tokens[this._index++];
      } else {
        return new Token("EOF", "<EOF>");
      }
    }
  
    parseLo() {
      this.decl();
    }
  
    // decl : var
    //      : ID
    //      : :
    //      : TYPE
    //      : ;
    //      | decl
    record() {
      let g_arr=[];
      while(this.tok.kind != "END" && this._index<this._tokens.length){
        let rec_op = [];
        rec_op.push(this.tok.lexeme);
        this.consume("IDENTIFIER");
        this.consume(":");
        if(this.tok.kind == "RECORD"){
          this.consume("RECORD");
          rec_op.push(this.record());
        }
         else if(this.tok.kind == "TYPE"){
          if(this.tok.kind == "END"){
            exit(1)
          }
          rec_op.push(this.tok.lexeme);
          this.consume("TYPE");
          this.consume(";");
        }
        g_arr.push(rec_op);
  
      }
      this.consume("END")
      this.consume(";");
      return g_arr;
    }
    decl() {
      let op_fin = [];
      while(this.tok.kind == "VARIABLE"){
        let o_p = [];
        this.consume("VARIABLE");
        o_p.push(this.tok.lexeme);
        this.consume("IDENTIFIER");
        this.consume(":");
        if (this.tok.kind == "RECORD") {
          // == ===
          this.consume("RECORD");
          if(this.tok.kind == "END"){
            exit(1)
          }
          let rec_op = this.record();
          o_p.push(rec_op);
        }else{
          if(this.tok.kind == "END"){
            this.consume("END");
          }
          else if(this.tok.kind == "TYPE"){
            o_p.push(this.tok.lexeme);
            this.consume("TYPE");
            this.consume(";");
          }
        }
          op_fin.push(o_p);
      }
     
      
      
      console.log(JSON.stringify(op_fin,null,2));
      fs.appendFile("out.txt","\n",function(err){
        if(err){
          throw err;
        }
      })
      fs.appendFile("out.txt",JSON.stringify(op_fin),function(err){
        if(err){
          throw err;
        }
      })
    }
    
  }
    
   //Parser
  
  function scan(str) {
    if(str.length == 0){
      console.log("[]");
      exit(1)
    }
    const toks = [];
    let m;
    for (let s = str; s.length > 0; s = s.slice(m[0].length)) {
      
      if (m = s.match(/^#/)) {  //any comment
        // if(s.match(/^[\n]/g)){
        //   continue;
        // }
        let sp = s.split(/^r?\n|\r|\n/);
        sp.shift();
        s = sp.join("\n")
        //console.log(s);
      }
      else if (m = s.match(/^[ \t\n\r]+/)) { //s starts with linear whitespace
        continue; //skip linear whitespace
      }
      else if (m = s.match(/\b^var?\b/)) { //to match just var
        toks.push(new Token('VARIABLE', m[0]));
      }
      else if (m = s.match(/\b^number?\b/)) {  //number word
        toks.push(new Token('TYPE', m[0]));
      }
      else if (m = s.match(/\b^end?\b/)) {  //end word
        toks.push(new Token('END', m[0]));
      }
      else if (m = s.match(/\b^record?\b/)) {  //record word
        toks.push(new Token('RECORD', m[0]));
      }
      else if (m = s.match(/\b^string?\b/)) {  //String word
        toks.push(new Token('TYPE', m[0]));
      }
      else if (m = s.match(/^[A-Za-z0-9_]+/i)) {  //IDentifiers
        toks.push(new Token('IDENTIFIER', m[0]));
      }
      else if (m = s.match(/^[:,;?]/)) {  //symbols
        toks.push(new Token(m[0], m[0]));
      }
      
      
  
    }
    if(toks.length == 0){
      console.log("[]");
      exit(1)
    }
    //console.log(toks);
    
  
   //console.log(toks);
    return toks;
  }
  
  class Token {
    constructor(kind, lexeme) {
      Object.assign(this, {kind, lexeme});
    }
  }
  
  const fs = require('fs');
  const { exit } = require('process');
  
  const fileContents = fs.readFileSync('input.txt','utf8').toString();
  
  let tokens = scan(fileContents)
  
  let parser = new Parser(tokens)
  parser.parse();
  
  //expr = "var personPosition : record\nname: record\n firstName: string;\n lastName: string;\nend;\nposition: record\n x: number;\n y: number;\n z: number;\n end;\nend;"