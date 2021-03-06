import React,{useEffect, useState} from 'react';
import Papa from 'papaparse';
import {csv} from '../shared/PostFileOutput';
import { getRandromPost } from '../shared/postsServerRequests';
import {Varient} from '../shared/varients';
import {ColoredCard,GradePicker, MultiSelectPicker} from './commons';
import '../css/commectForm.css';
import { randomDate } from 'src/helpers/random';
import {integrate} from 'src/shared/bagelDb';
interface ParsedComment {
    username : string,
    varient: Varient,
    text: string,
    grade?: number,
    review?:string,
    createdAt: String
}


export default function CommentForm(){
    
    var isLoad = false;
    const [postToShow,setPostToShow] = useState<ParsedComment>();
    const [isHide, setisHide] = useState<boolean>(false);
    const [pickedOptions, setPickedOptions] = useState<string[]>([]);
    const [options, setOptions] = useState<string[]>([])
    useEffect(() => {
        if(!isLoad) {
            setRandomPost();
            loadOptions();
            loadPost();
            isLoad = true;
        }
    },[setPostToShow])


    const loadOptions = async () =>{
        const res = await integrate('reasons')
        setOptions(res);
    }

    const loadPost = async() =>{
        const res = await getRandromPost(1);
    }
    const setRandomPost = () => {
        Papa.parse(csv, {
            complete: function(results:any) {
                const randNum = Math.floor(Math.random() * Math.floor(results.data.length))
                const reandomDate = randomDate(new Date(2012, 0, 1), new Date());
                const year = reandomDate.getFullYear();
                const month = reandomDate.getMonth();
                const day = reandomDate.getDate();
        
                const hrs = Math.floor(Math.random() * Math.floor(24))
                const mins = Math.floor(Math.random() * Math.floor(60))
                const comment : ParsedComment = {
                    username: results.data[randNum][0],
                    text: results.data[randNum][1],
                    varient: randNum%6+1,
                    review: '',
                    createdAt: `${day}/${month}/${year}  ${hrs}:${mins < 10 ? '0'+mins: mins}`
                } 
                setPickedOptions([])
                setPostToShow(comment)
            }
        });
    }
    const buildFooter = () =>{
        return  <div className="row"  style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button className="btn btn-primary" onClick={() => {
                        setisHide(true);
                        setTimeout(() => {
                            setRandomPost()
                            setisHide(false)
                        },1000)
                    }}>שלח</button>                
                </div>

    }

    const onReviewTextareaChange = (event:React.FormEvent<HTMLTextAreaElement>) => {
        const text = event.currentTarget.value;
        const updatedPost :any = {
            ...postToShow,
            review: text
        }
        setPostToShow(updatedPost)
    }

    const buildHeader = () => {

        return <div className="d-flex justify-content-between">
            <span>תגובה</span>
            <span>{postToShow?.createdAt}</span>
        </div>
    }
    return(
        <div className={`form ${isHide? 'hide':''} d-flex justify-content-center`}>
            {
                postToShow&&
                <ColoredCard
                    varient={postToShow?.varient}
                    type='Comment'
                    header={buildHeader()}
                    textHeader={postToShow.username}
                    footer={buildFooter()}
                >
                    <React.Fragment>
                        {postToShow.text}
                        <hr/>
                        <label>
                        דירוג אנליסט
                        </label>
                        <GradePicker
                         onPick={(val:any) => {
                                const updatedPost = {
                                    ...postToShow,
                                    grade: val
                                }
                                setPostToShow(updatedPost)
                            }}
                            pickedValue={postToShow.grade}/>
                            <hr/>
                            <label>
                            סיבת דירוג אנליסט
                            </label>

                            <MultiSelectPicker  options={options.filter((op:any) => !pickedOptions.includes(op))}
                                                pickedValues={pickedOptions}
                                                onDrop={(value:string) => setPickedOptions(pickedOptions.filter(op => op != value))}
                                                onPick={(value:string) => setPickedOptions([...pickedOptions,value])}/>
                            <hr/>
                            <label htmlFor="review">
                                סקירת אנליסט
                            </label>
                            <textarea   id="review" 
                                        name="review" 
                                        className="form-control" 
                                        value={postToShow.review}
                                        onChange={onReviewTextareaChange}
                                        style={{fontSize: '12px'}} />

                    </React.Fragment>
                </ColoredCard>
            }
        </div>
    )
}