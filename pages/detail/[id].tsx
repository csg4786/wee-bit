import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
// import { GoVerified } from 'react-icons/go';
import { faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { MdOutlineCancel } from 'react-icons/md';
import { BsFillPlayFill, BsDownload, BsShareFill } from 'react-icons/bs';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';

import Comments from '../../components/Comments';
import { BASE_URL } from '../../utils';
import LikeButton from '../../components/LikeButton';
import useAuthStore from '../../store/authStore';
import { Video } from '../../types';
import axios from 'axios';

import Swal from 'sweetalert2'
const ld = require('lodash')

interface IProps {
  postDetails: Video;
}

const Detail = ({ postDetails }: IProps) => {
  const [post, setPost] = useState(postDetails);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const { userProfile }: any = useAuthStore();

  const onVideoClick = () => {
    if (isPlaying) {
      videoRef?.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef?.current?.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (post && videoRef?.current) {
      videoRef.current.muted = isVideoMuted;
    }
  }, [post, isVideoMuted]);

  const handleLike = async (like: boolean) => {
    if (userProfile) {
      const res = await axios.put(`${BASE_URL}/api/like`, {
        userId: userProfile._id,
        postId: post._id,
        like
      });
      setPost({ ...post, likes: res.data.likes });
    }
  };

  const addComment = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (userProfile) {
      if (comment) {
        setIsPostingComment(true);
        const res = await axios.put(`${BASE_URL}/api/post/${post._id}`, {
          userId: userProfile._id,
          comment,
        });

        setPost({ ...post, comments: res.data.comments });
        setComment('');
        setIsPostingComment(false);
      }
    }
  };

  // const [copied, setCopied] = useState(false);

  const share = () => {

    Swal.fire({
      confirmButtonText: `Copy to Clipboard`,
      footer: `${BASE_URL}/detail/${postDetails._id}`
    }).then(()=>{
      navigator.clipboard.writeText(`${BASE_URL}/detail/${postDetails._id}`);
      // setCopied(true);
    })

    console.log(videoRef.current?.src)
  }

  const download = async () => {
    const response = await fetch(''+videoRef.current?.src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
  const downloadUrl = url;
  Swal.fire({
    text: `Click the button below to download the video`,
    showCancelButton: true,
    confirmButtonText: 'Download',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${ld.kebabCase(`${postDetails.postedBy.userName}`)+'__'+postDetails._id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });
}

  return (
    <>
      {post && (
        <div className='flex w-full absolute left-0 top-0 bg-inherit flex-wrap lg:flex-nowrap'>
          <div className='relative flex-2 w-[1000px] lg:w-9/12 flex justify-center items-center bg-black bg-no-repeat bg-cover bg-center'>
            <div className='opacity-90 absolute top-6 left-2 lg:left-6 flex gap-6 z-50'>
              <p className='cursor-pointer ' onClick={() => router.back()}>
                <MdOutlineCancel className='text-white text-[35px] hover:opacity-90' />
              </p>
            </div>
            <div className='relative'>
              <div className='lg:h-[100vh] h-[60vh]'>
                <video
                  ref={videoRef}
                  onClick={onVideoClick}
                  loop
                  src={post?.video?.asset.url}
                  className=' h-full cursor-pointer'
                ></video>
              </div>

              <div className='absolute top-[45%] left-[40%]  cursor-pointer'>
                {!isPlaying && (
                  <button onClick={onVideoClick}>
                    <BsFillPlayFill className='text-white text-6xl lg:text-8xl' />
                  </button>
                )}
              </div>
            </div>
            <div className='flex flex-row justify-between absolute bottom-5 w-full'>
                  <div className='flex-row m-2 cursor-pointer'>
              {isVideoMuted ? (
                <button onClick={() => setIsVideoMuted(false)}>
                  <HiVolumeOff className='text-white text-3xl lg:text-4xl' />
                </button>
              ) : (
                <button onClick={() => setIsVideoMuted(true)}>
                  <HiVolumeUp className='text-white text-3xl lg:text-4xl' />
                </button>
              )}
            </div>
            <div className='flex-row m-2 cursor-pointer'>
                <button onClick={share}>
                  <BsShareFill className='text-gray-300 text-2xl lg:text-4xl font-bold' />
                </button>
            </div>
            <div className='flex-row m-2 cursor-pointer'>
                <div>
                  <button onClick={download}>
                    <BsDownload className='text-gray-300 text-2xl lg:text-4xl font-bold' />
                  </button>
                </div>
            </div>
            </div>
            
          </div>
          <div className='relative w-[1000px] md:w-[900px] lg:w-[700px]'>
            <div className='lg:mt-20 mt-10'>
              <Link href={`/profile/${post.postedBy._id}`}>
                <div className='flex gap-4 mb-4 bg-inherit w-full pl-10 cursor-pointer'>
                  <Image
                    width={60}
                    height={60}
                    alt='user-profile'
                    className='rounded-full'
                    src={post.postedBy.image}
                  />
                  <div>
                    <div className='text-xl font-bold lowercase tracking-wider flex gap-2 items-center justify-center'>
                      {post.postedBy.userName.replace(/\s+/g, '')}{' '}
                      {/* <GoVerified className='text-blue-400 text-xl' /> */}
                      <FontAwesomeIcon icon={faUserShield} className='text-blue-400 text-xl' />
                    </div>
                    <p className='text-md'> {post.postedBy.userName}</p>
                  </div>
                </div>
              </Link>
              <div className='px-10'>
                <p className=' text-md text-gray-300'>{post.caption}</p>
              </div>
              <div className='mt-10 px-10 '>
                {userProfile && <LikeButton
                  likes={post.likes}
                  flex='flex'
                  handleLike={() => handleLike(true)}
                  handleDislike={() => handleLike(false)}
                />}
              </div>
              <Comments
                comment={comment}
                setComment={setComment}
                addComment={addComment}
                comments={post.comments}
                isPostingComment={isPostingComment}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const getServerSideProps = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const res = await axios.get(`${BASE_URL}/api/post/${id}`);

  return {
    props: { postDetails: res.data },
  };
};

export default Detail;
