// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { useVoiceCompanion } from "../src/voice/useVoiceCompanion";

beforeEach(()=>{
 const track={enabled:true,stop:vi.fn()};
 const stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
 vi.stubGlobal("navigator",{mediaDevices:{getUserMedia:vi.fn(async()=>stream)}});
 const handlers: Array<(event:MessageEvent)=>void>=[];
 const channel={readyState:"open",close:vi.fn(),addEventListener:(_name:string,callback:(event:MessageEvent)=>void)=>handlers.push(callback),send:vi.fn((raw:string)=>{
   if(JSON.parse(raw).type==="session.close") handlers.forEach(fn=>fn({data:JSON.stringify({type:"session.closed"})} as MessageEvent));
 })};
 const peer={iceGatheringState:"complete",connectionState:"connected",localDescription:{sdp:"offer"},createDataChannel:()=>channel,addTrack:vi.fn(),createOffer:async()=>({type:"offer",sdp:"offer"}),setLocalDescription:vi.fn(async()=>undefined),setRemoteDescription:vi.fn(async()=>undefined),close:vi.fn()};
 vi.stubGlobal("RTCPeerConnection",function(){return peer});
 vi.stubGlobal("Audio",function(){return {autoplay:true,muted:false,volume:1,play:vi.fn(async()=>undefined),pause:vi.fn()}});
 vi.stubGlobal("fetch",vi.fn(async()=>Response.json({transport:{sdp:"answer"}})));
 Object.assign(globalThis,{qaVoice:{track,peer,channel,emit:(value:object)=>handlers.forEach(fn=>fn({data:JSON.stringify(value)} as MessageEvent))}});
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks()});
describe("voice connection and tool delivery",()=>{
 it.each(["chess","ludo","intercept","tic-tac-toe"])("opens %s, delivers a tool exactly once, mutes and closes",async(gameId)=>{
   const qa=(globalThis as any).qaVoice;
   const executor={execute:vi.fn(async()=>JSON.stringify({status:"completed",message:"Done"})),cancelRequests:vi.fn()};
   const {result}=renderHook(()=>useVoiceCompanion(executor,false,gameId,"home",35));
   await act(async()=>{await result.current.start();qa.emit({type:"session.started"})});
   expect(result.current.status).toBe("connected");
   const request=JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
   expect(request.gameId).toBe(gameId);
   const event={type:"response.event",event:{type:"response.output_item.done",item:{type:"function_call",call_id:"same-id",name:"get_position",arguments:"{}"}}};
   await act(async()=>{qa.emit(event);qa.emit(event)});
   await waitFor(()=>expect(executor.execute).toHaveBeenCalledTimes(1));
   expect(qa.channel.send.mock.calls.some(([raw]:[string])=>JSON.parse(raw).type==="response.item.create")).toBe(true);
   act(()=>result.current.toggleMicrophone());expect(qa.track.enabled).toBe(false);
   await act(async()=>{await result.current.stop()});expect(qa.track.stop).toHaveBeenCalled();expect(result.current.status).toBe("idle");
 });
 it("provider failure releases the microphone and leaves a recoverable error",async()=>{
   vi.mocked(fetch).mockResolvedValueOnce(Response.json({error:"network"},{status:502}));
   const executor={execute:vi.fn(async()=>"{}")};const {result}=renderHook(()=>useVoiceCompanion(executor,false,"ludo"));
   await act(async()=>{await result.current.start()});expect(result.current.status).toBe("error");expect((globalThis as any).qaVoice.track.stop).toHaveBeenCalled();
 });
});
