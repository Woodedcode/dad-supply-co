import DadStandardTee from "../assets/dad-standard-tee.png";
import DadStandardHat from "../assets/dad-standard-hat.png";
import ImpastaFront from "../assets/impasta-front.png";
import ImpastaBack from "../assets/impasta-back.png";
import DadStandardJuniorFront from "../assets/dad-standard-junior-front.png";
import DadStandardJuniorBack from "../assets/dad-standard-junior-back.png";
import DadStandardBabyFront from "../assets/dad-standard-baby-front.png";
import DadStandardBabyBack from "../assets/dad-standard-baby-back.png";
import checkerMatchingSetRed from "../assets/dad-standard-checker-matching-set-red.png";

const products = [
    {
        id:1,
        name: "Dad Standard Tee",
        price: "$28.00",
        image: DadStandardTee,
        type:"shirt",
        sizes: ["S", "M", "L", "XL", "2XL"]
    },
    {
        id:2,
        name: "Dad Standard Hat",
        price: "$25.00",
        image: DadStandardHat,
        type: "hat",
        sizes: ["One Size"]
    },
    {
        id: 3,
        name: "Im-pasta Tee",
        price: "$28.00",
        type: "shirt",
        image: ImpastaBack,
        backImage: ImpastaFront,
        description:
            "A classic dad-joke tee featuring the ultimate fake noodle. Soft, comfortable, and built for maximum eye-roll potential.",
        sizes: ["S", "M", "L", "XL", "2XL"],
},
{
        id: 4,
        name: "Dad Standard Junior Tee",
        price: "$22.00",
        type: "kid",
        image: DadStandardJuniorFront,
        backImage: DadStandardJuniorBack,
        description:
            "Official gear for the next generation of dad-joke professionals.",
        sizes: ["2T", "3T", "4T", "5T"],
},
{
        id: 5,
        name: "Dad Standard Baby Onesie",
        price: "$22.00",
        type: "kid",
        image: DadStandardBabyFront,
        backImage: DadStandardBabyBack,
        description:
            "Official gear for the next generation of dad-joke professionals.",
        sizes: ["0-3M", "3-6M", "6-12M", "12-18M", "18-24M"],
},
{
        id: 6,
        name: "Dad Standard Checker Matching Set",
        price: "$48.00",
        type: ["matching-set", "shirt"],
        image: checkerMatchingSetRed,
        description: "A matching checkerboard set for Dad and his little sidekick.",
        dadSizes: ["S", "M", "L", "XL", "2XL"],
        kidSizes: ["0-3M", "3-6M", "6-12M", "12-18M"],
},
]

export default products;