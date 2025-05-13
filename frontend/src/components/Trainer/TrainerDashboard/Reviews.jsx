import { AlertCircle, AlertTriangle, Award, Loader2, Star, ThumbsUp, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
    <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
      <Icon className="w-6 h-6 text-[#ffc929]" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const SortButton = ({ label, value, isActive, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
      isActive
        ? "bg-gradient-to-r from-yellow-500 to-pink-500 text-white"
        : "text-gray-600 bg-gray-100 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50"
    }`}
    aria-label={`Sort by ${label}`}
  >
    {label}
  </button>
);

const FilterButton = ({ rating, isActive, onClick }) => (
  <button
    onClick={() => onClick(rating)}
    className={`w-8 h-8 text-sm font-medium rounded-md ${
      isActive
        ? "bg-gradient-to-r from-yellow-500 to-pink-500 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50"
    }`}
    aria-label={`Filter by ${rating} stars`}
  >
    {rating}
  </button>
);

const RatingBar = ({ rating, count, total }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center w-12">
      <span className="text-sm font-medium text-gray-700">{rating}</span>
      <Star className="w-4 h-4 ml-1 text-[#ffc929] fill-[#ffc929]" />
    </div>
    <div className="relative flex-1 h-3 bg-gray-200 rounded-full">
      <div
        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-yellow-500 to-pink-500"
        style={{ width: total ? `${(count / total) * 100}%` : "0%" }}
      ></div>
    </div>
    <span className="w-8 text-sm text-gray-600">{count}</span>
  </div>
);

const Reviews = ({ isSidebarCollapsed }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterRating, setFilterRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0],
  });
  const { user } = useApp();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/user/trainer/${user._id}/reviews`);
      const fetchedReviews = response.data.reviews || [];
      setReviews(fetchedReviews);

      if (fetchedReviews.length > 0) {
        const total = fetchedReviews.length;
        const sum = fetchedReviews.reduce((acc, review) => acc + review.rating, 0);
        const average = sum / total;
        const distribution = [0, 0, 0, 0, 0];
        fetchedReviews.forEach((review) => {
          distribution[review.rating - 1]++;
        });
        setStats({ average: average.toFixed(1), total, distribution });
      }
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? "Reviews not found. Please contact support."
          : err.response?.data?.message || "Failed to load reviews";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right", autoClose: 3000, theme: "light" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      if (user.isActive && !user.isArchieve) {
        fetchReviews();
      }
      if (!user.isActive) {
        setError("Your account is deactivated. Please contact support.");
      }
    } else {
      setError("User not authenticated");
      setLoading(false);
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? "text-[#ffc929] fill-[#ffc929]" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const handleSort = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleFilterRating = (rating) => {
    setFilterRating(rating === filterRating ? 0 : rating);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilterRating(0);
    setSortOrder("newest");
    setCurrentPage(1);
  };

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];
    if (filterRating > 0) {
      result = result.filter((review) => review.rating === filterRating);
    }
    return result.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === "highest") return b.rating - a.rating;
      return a.rating - b.rating;
    });
  }, [reviews, filterRating, sortOrder]);

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    return filteredAndSortedReviews.slice(start, start + reviewsPerPage);
  }, [filteredAndSortedReviews, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedReviews.length / reviewsPerPage);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen bg-gradient-to-br from-yellow-50 to-pink-50 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
      }`}>
        <Loader2 className="w-10 h-10 text-[#ffc929] animate-spin" />
        <span className="ml-3 text-base text-gray-700">Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
      }`}>
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-sm">
          <X className="w-8 h-8 mx-auto mb-3 text-[#ffc929]" />
          <h2 className="mb-2 text-lg font-semibold text-gray-800">Reviews Error</h2>
          <p className="text-sm text-gray-600">{error}</p>
          {error.includes("contact support") && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-sm text-white bg-[#ffc929] rounded-md hover:bg-[#ffa726]"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className={`flex-1 p-4 sm:p-6 space-y-6 transition-all duration-300 ease-in-out ${
      isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
    }`}>
      <section className="overflow-hidden bg-white shadow-sm rounded-lg">
        {(!user.isActive || user.isArchieve) && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border-b border-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">
              {user.isArchieve
                ? "Your account is archived. Reviews are disabled until restored."
                : "Your account is deactivated. Reviews are disabled until reactivated."}
            </p>
          </div>
        )}
        <div
          className="px-6 py-4 border-l-4"
          style={{ borderImage: "linear-gradient(to bottom, #ffc929, #ffa726) 1" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-50">
              <FaRegCommentDots className="w-6 h-6 text-[#ffc929]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Client Reviews</h1>
              <p className="text-sm text-gray-500">Feedback from your clients</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-0">
          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {reviews.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <SectionCard icon={Award} title="Rating Overview">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-800">{stats.average}</span>
                      <div className="flex justify-center mb-2">{renderStars(Math.round(parseFloat(stats.average)))}</div>
                      <p className="text-sm text-gray-600">{stats.total} reviews</p>
                    </div>
                  </SectionCard>
                  <SectionCard icon={ThumbsUp} title="Rating Distribution">
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <RatingBar
                          key={rating}
                          rating={rating}
                          count={stats.distribution[rating - 1]}
                          total={stats.total}
                        />
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}
              <div className="flex flex-wrap justify-between items-center px-6 py-3 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-0">
                  {[
                    { label: "Newest", value: "newest" },
                    { label: "Oldest", value: "oldest" },
                    { label: "Highest", value: "highest" },
                    { label: "Lowest", value: "lowest" },
                  ].map((option) => (
                    <SortButton
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      isActive={sortOrder === option.value}
                      onClick={handleSort}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <FilterButton
                      key={rating}
                      rating={rating}
                      isActive={filterRating === rating}
                      onClick={handleFilterRating}
                    />
                  ))}
                  {filterRating > 0 && (
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1.5 text-sm text-white bg-[#ffc929] rounded-md hover:bg-[#ffa726]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <SectionCard icon={Star} title="Reviews">
                {reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <Star className="w-10 h-10 mx-auto mb-3 text-[#ffc929]" />
                    <h3 className="text-lg font-semibold text-gray-800">No Reviews Yet</h3>
                    <p className="text-sm text-gray-600">Encourage clients to leave feedback.</p>
                  </div>
                ) : paginatedReviews.length === 0 ? (
                  <div className="text-center py-6">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 text-[#ffc929]" />
                    <h3 className="text-lg font-semibold text-gray-800">No Matching Reviews</h3>
                    <button
                      className="px-3 py-1.5 mt-3 text-sm text-white bg-[#ffc929] rounded-md hover:bg-[#ffa726]"
                      onClick={resetFilters}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Showing {paginatedReviews.length} of {filteredAndSortedReviews.length} reviews
                    </p>
                    {paginatedReviews.map((review) => (
                      <div
                        key={review._id}
                        className="p-4 bg-gray-50 border border-gray-100 rounded-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {review.userId?.image ? (
                              <img
                                src={review.userId.image}
                                alt={review.userId.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-base text-gray-600">
                                {review.userId?.fullName?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap justify-between items-center">
                              <div>
                                <span className="text-base font-semibold text-gray-800">
                                  {review.userId?.fullName || "Anonymous"}
                                </span>
                                <span className="text-sm text-gray-500 ml-3">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                              <div className="flex mt-1 sm:mt-0">{renderStars(review.rating)}</div>
                            </div>
                            <p className="text-base text-gray-600 mt-2">
                              {review.comment || <span className="italic">No comment</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {totalPages > 1 && (
                      <div className="flex justify-center space-x-3 mt-4">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer />
    </main>
  );
};

export default Reviews;