/**
Author: (c) Joseph Cheng
last updated: 2012/7/3
**/

#include <glcd.h>

#define SOP '{'
#define EOP '}'

boolean started = false;
boolean ended = false;

char inData[17]; // sx,sy:dx,dy;
byte index = 0;

unsigned int sx; // 0 ~ 128
unsigned int sy; // 0 ~ 64
unsigned int dx;
unsigned int dy;

void setup() {
  
  // Initialize serial
  Serial.begin(9600);
  
  // Initialize GLCD
  GLCD.Init(NON_INVERTED);
}

void loop() {
  
  if(Serial.available()) { 
    
    while(Serial.available() > 0) {
  
      char inChar = Serial.read();

      if(inChar == SOP) {
        index = 0;
        inData[index] = '\0';
        started = true;
        ended = false;
      } else if(inChar == EOP) {
        ended = true;
        break;
      } else {
        inData[index++] = (char) inChar;
        inData[index] = '\0';
      }
    }

    if(started && ended) {
      
      Serial.println(inData);
      
      if(strcmp(inData, "c") == 0) {
        GLCD.ClearScreen();
      }
      
      if(sscanf(inData, "%d,%d:%d,%d", &sx, &sy, &dx, &dy) == 4) {
        GLCD.DrawLine(sx, sy, dx, dy, BLACK);
      }

      // Reset for the next packet
      started = false;
      ended = false;
      index = 0;
      inData[index] = '\0';
    }
  }
}

inline const char * const BoolToString(bool b) {
  return b ? "true" : "false";
}
