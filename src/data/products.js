import DadSupplyTee from "../assets/dad-supply-tee.png";
import DadSupplyHat from "../assets/dad-supply-hat.png";
import ImpastaFront from "../assets/impasta-front.png";
import ImpastaBack from "../assets/impasta-back.png";
import DadSupplyJuniorFront from "../assets/dad-supply-junior-front.png";
import DadSupplyJuniorBack from "../assets/dad-supply-junior-back.png";
import DadSupplyBabyFront from "../assets/dad-supply-baby-front.png";
import DadSupplyBabyBack from "../assets/dad-supply-baby-back.png";
import checkerMatchingSetRed from "../assets/dad-supply-checker-matching-set-red.png";

const products = [
    {
        id:1,
        name: "Dad Supply Tee",
        price: "$28.00",
        image: DadSupplyTee,
        type:"shirt",
        sizes: ["S", "M", "L", "XL", "2XL"]
    },
    {
        id:2,
        name: "Dad Supply Hat",
        price: "$25.00",
        image: DadSupplyHat,
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
        name: "Dad Supply Junior Tee",
        price: "$22.00",
        type: "kid",
        image: DadSupplyJuniorFront,
        backImage: DadSupplyJuniorBack,
        description:
            "Official gear for the next generation of dad-joke professionals.",
        sizes: ["2T", "3T", "4T", "5T"],
},
{
        id: 5,
        name: "Dad Supply Baby Onesie",
        price: "$22.00",
        type: "kid",
        image: DadSupplyBabyFront,
        backImage: DadSupplyBabyBack,
        description:
            "Official gear for the next generation of dad-joke professionals.",
        sizes: ["0-3M", "3-6M", "6-12M", "12-18M", "18-24M"],
},
{
        id: 6,
        name: "Dad Supply Checker Matching Set",
        price: "$48.00",
        type: "matching-set",
        image: checkerMatchingSetRed,
        description: "A matching checkerboard set for Dad and his little sidekick.",
        dadSizes: ["S", "M", "L", "XL", "2XL"],
        kidSizes: ["0-3M", "3-6M", "6-12M", "12-18M"],
},
]

export default products;