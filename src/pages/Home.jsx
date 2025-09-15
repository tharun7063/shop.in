import React, { useEffect, useState, useRef } from "react";
import useStore from "../store/useStore";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

// Skeleton loader component with animation styles
function SkeletonLoader() {
    return (
        <div className="w-full h-60 md:h-80 rounded-lg bg-gray-300 animate-pulse" />
    );
}

export default function Home() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true); // loading state
    const backend_url = useStore((state) => state.backend_url);

    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const swiperRef = useRef(null);

    useEffect(() => {
        setLoading(true); // start loading
        fetch(`${backend_url}/banner`)
            .then((res) => res.json())
            .then((data) => {
                setBanners(data.data || []);
                setLoading(false); // finished loading
            })
            .catch((err) => {
                console.error("Error fetching banners:", err);
                setLoading(false); // finish loading even on error
            });
    }, [backend_url]);

    useEffect(() => {
        if (swiperRef.current && prevRef.current && nextRef.current) {
            swiperRef.current.params.navigation.prevEl = prevRef.current;
            swiperRef.current.params.navigation.nextEl = nextRef.current;

            swiperRef.current.navigation.destroy();
            swiperRef.current.navigation.init();
            swiperRef.current.navigation.update();
        }
    }, [banners]);

    return (
        <div className="mt-4 relative">
            {loading ? (
                <div className="space-y-4">
                    <SkeletonLoader />
                </div>
            ) : (
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    loop={true}
                    speed={800}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    navigation={{
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    className="rounded-lg shadow-lg relative"
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.id}>
                            <div className="relative">
                                <img
                                    src={banner.image_url}
                                    alt={banner.title}
                                    className="w-full h-60 md:h-80 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-start text-center px-4 pt-6 md:pt-12">
                                    <h2 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
                                        {banner.title}
                                    </h2>
                                    {banner.description && (
                                        <p className="mt-2 text-lg md:text-xl text-gray-200 max-w-2xl">
                                            {banner.description}
                                        </p>
                                    )}
                                    {(banner.start_date || banner.end_date) && (
                                        <p className="mt-2 text-sm md:text-base text-gray-300">
                                            {banner.start_date
                                                ? `From: ${new Date(
                                                    banner.start_date
                                                ).toLocaleDateString()} `
                                                : ""}
                                            {banner.end_date
                                                ? `To: ${new Date(banner.end_date).toLocaleDateString()}`
                                                : ""}
                                        </p>
                                    )}
                                    {banner.discount && (
                                        <p className="mt-2 text-lg font-bold text-yellow-400">
                                            Discount: {banner.discount}%
                                        </p>
                                    )}
                                    <a
                                        href={banner.link_url || "#"}
                                        target={banner.link_url ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition transform hover:scale-105"
                                    >
                                        View Offer
                                    </a>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}

                    <button
                        ref={prevRef}
                        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition transform hover:scale-110 z-10"
                        aria-label="Previous slide"
                    >
                        <FontAwesomeIcon
                            icon={faChevronLeft}
                            className="text-blue-600 text-xl"
                        />
                    </button>
                    <button
                        ref={nextRef}
                        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition transform hover:scale-110 z-10"
                        aria-label="Next slide"
                    >
                        <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-blue-600 text-xl"
                        />
                    </button>
                </Swiper>
            )}
        </div>
    );
}
