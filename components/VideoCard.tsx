import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import { BsFillPlayFill, BsFillPauseFill, BsDownload, BsShareFill } from 'react-icons/bs';

import Swal from 'sweetalert2'
const ld = require('lodash')

import { BASE_URL } from '../utils';

// import { GoVerified } from 'react-icons/go';

import { faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { BsPlay } from 'react-icons/bs';

import { Video } from './../types';

interface IProps {
  post: Video;
  isShowingOnHome?: boolean;
}

const VideoCard: NextPage<IProps> = ({ post: { caption, postedBy, video, _id, likes }, isShowingOnHome }) => {
  const [playing, setPlaying] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onVideoPress = () => {
    if (playing) {
      videoRef?.current?.pause();
      setPlaying(false);
    } else {
      videoRef?.current?.play();
      setPlaying(true);
    }
  };

  // const [copied, setCopied] = useState(false);

  const share = () => {

    Swal.fire({
      confirmButtonText: `Copy to Clipboard`,
      footer: `${BASE_URL}/detail/${_id}`
    }).then(()=>{
      navigator.clipboard.writeText(`${BASE_URL}/detail/${_id}`);
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
      a.download = `${ld.kebabCase(`${postedBy.userName}`)+'__'+_id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });
}

  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.muted = isVideoMuted;
    }
  }, [isVideoMuted]);

  if(!isShowingOnHome) {
    return (
      <div>
        <Link href={`/detail/${_id}`}>
          <video
            loop
            src={video.asset.url}
            className='w-[250px] md:w-full rounded-xl cursor-pointer'
          ></video>
        </Link>
            <div className='flex gap-2 -mt-8 items-center ml-4'>
              <p className='text-white text-lg font-medium flex gap-1 items-center'>
                <BsPlay className='text-2xl' />
                {likes?.length || 0}
              </p>
            </div>
        <Link href={`/detail/${_id}`}>
          <p className='mt-5 text-md text-gray-300 cursor-pointer w-210'>
            {caption}
          </p>
        </Link>
      </div>
    )
  }

  return (
    <div className='flex flex-col border-b-2 border-gray-200 pb-6'>
      <div>
        <div className='flex gap-3 p-2 cursor-pointer font-semibold rounded '>
          <div className='md:w-16 md:h-16 w-10 h-10'>
            <Link href={`/profile/${postedBy?._id}`}>
              <>
                <Image
                  width={62}
                  height={62}
                  className=' rounded-full'
                  src={postedBy?.image}
                  alt='user-profile'
                  layout='responsive'
                />
              </>
            </Link>
          </div>
          <div>
            <Link href={`/profile/${postedBy?._id}`}>
              <div className='flex items-center gap-2'>
                <p className='flex gap-2 items-center md:text-md font-bold text-secondary'>
                  {postedBy.userName}{' '}
                  {/* <GoVerified className='text-[#f51997]-400 text-md' /> */}
                  <FontAwesomeIcon icon={faUserShield} className='text-[#f51997]-400 text-md' />
                </p>
                <p className='capitalize font-medium text-xs text-gray-500 hidden md:block'>
                  {postedBy.userName}
                </p>
              </div>
            </Link>
            <Link href={`/detail/${_id}`}>
              <p className='mt-2 font-normal '>{caption}</p>
            </Link>
          </div>
        </div>
      </div>

      <div className='lg:ml-20 flex gap-4 relative'>
        <div
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className='rounded-3xl'
        >
          <Link href={`/detail/${_id}`}>
            <video
              loop
              ref={videoRef}
              src={video.asset.url}
              className='lg:w-[600px] h-[300px] md:h-[400px] lg:h-[528px] w-[200px] rounded-2xl cursor-pointer bg-gray-900'
            ></video>
          </Link>

          {isHover && (
            <div className='absolute bottom-6 cursor-pointer left-8 md:left-14 lg:left-0 flex gap-10 lg:justify-between w-[100px] md:w-[50px] lg:w-[600px] p-3'>
              {isVideoMuted ? (
                <button onClick={() => setIsVideoMuted(false)}>
                  <HiVolumeOff className='text-gray-300 text-2xl lg:text-4xl' />
                </button>
              ) : (
                <button onClick={() => setIsVideoMuted(true)}>
                  <HiVolumeUp className='text-gray-300 text-2xl lg:text-4xl' />
                </button>
              )}
              {playing ? (
                <button onClick={onVideoPress}>
                  <BsFillPauseFill className='text-gray-300 text-2xl lg:text-4xl' />
                </button>
              ) : (
                <button onClick={onVideoPress}>
                  <BsFillPlayFill className='text-gray-300 text-2xl lg:text-4xl' />
                </button>
              )}
              {(
                <button onClick={share}>
                  <BsShareFill className='text-gray-300 text-2xl lg:text-2xl font-bold' />
                </button>
              )}
              {(
                <div className='flex-row'>
                  <button onClick={download}>
                      <BsDownload className='text-gray-300 text-2xl lg:text-2xl font-bold' />
                  </button>
                  
                  {/* {downloadUrl && <a href={downloadUrl} download>
                    Link
                  </a>} */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
