const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold text-sm">
          {review.reviewer?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="font-medium text-gray-800 text-sm">{review.reviewer?.name || 'Anonymous'}</p>
          <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
        </div>
      </div>
      {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
    </div>
  );
};

export default ReviewCard;
