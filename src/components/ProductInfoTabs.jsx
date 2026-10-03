import { useState } from "react";

function ProductInfoTabs({ product }) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="product-info">
      <div className="product-info__tabs">
        <button
          className={
            activeTab === "description"
              ? "product-info__tab active"
              : "product-info__tab"
          }
          onClick={() => setActiveTab("description")}
          type="button"
        >
          Description
        </button>

        <button
          className={
            activeTab === "fabric"
              ? "product-info__tab active"
              : "product-info__tab"
          }
          onClick={() => setActiveTab("fabric")}
          type="button"
        >
          Fit + Fabric
        </button>

        <button
          className={
            activeTab === "care"
              ? "product-info__tab active"
              : "product-info__tab"
          }
          onClick={() => setActiveTab("care")}
          type="button"
        >
          Care
        </button>
      </div>

      <div className="product-info__content">
        {activeTab === "description" && (
          <div>
            <p>{product.description}</p>

            {product.tagline && (
              <p className="product-info__tagline">
                {product.tagline}
              </p>
            )}
          </div>
        )}

        {activeTab === "fabric" && (
          <div>
            {product.fabricIntro && (
              <p>{product.fabricIntro}</p>
            )}

            {product.fabricDetails?.length > 0 && (
              <ul>
                {product.fabricDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "care" && (
          <div>
            {product.careIntro && (
              <p>{product.careIntro}</p>
            )}

            {product.careInstructions?.length > 0 && (
              <ul>
                {product.careInstructions.map(
                  (instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ),
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductInfoTabs;