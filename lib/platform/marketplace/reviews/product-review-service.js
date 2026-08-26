export default class ProductReviewService {
  build(input = {}) {
    const selectedProduct = input.selectedProduct ?? null;
    const review = input.customerReview ?? {};

    return {
      reviewId: `REV-${Date.now()}`,
      productId: selectedProduct?.id ?? null,
      customerRating: review.rating ?? 5,
      feedback: review.feedback ?? "The marketplace product is clear to purchase, deploy, and upgrade.",
      featureRequests: review.featureRequests ?? [
        "More industry templates",
        "Faster deployment previews",
        "Additional upgrade bundles"
      ],
      signalsForUpgrade: [
        "Feature requests captured",
        "Customer satisfaction monitored",
        "Evolution engine feedback ready"
      ]
    };
  }
}
