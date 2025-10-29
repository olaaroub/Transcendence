
export function renderHomeText (isLoged: boolean)
{
    return `
		<div class="data flex flex-col sm:flex-row items-center justify-between min-h-[calc(100vh-200px)] gap-6 sm:gap-8 md:gap-10 xl:gap-12 2xl:gap-16 4k:gap-20 px-4 md:px-6 xl:px-8 2xl:px-10 4k:px-12">
			<div class="txt sm:w-1/2 transition-all duration-500 ${isLoged ? 'opacity-0' : ''}">
				<h1
					class="text-[40px] sm:text-[70px] md:text-[80px] lg:text-[100px] xl:text-[130px] 2xl:text-[150px]
					4k:text-[220px] font-bold text-[#F0F0F0] glow-stroke leading-[1.1] mb-4 sm:mb-6 xl:mb-8  4k:mb-12">
					Let's play<br/>Together...
				</h1>
				<p
					class="text-[#878787] max-w-[90%]
					sm:max-w-[431px] xl:max-w-[500px] 
					4k:max-w-[700px] text-[16px] sm:text-[18px]
					md:text-[20px] xl:text-[22px]  4k:text-[32px]
						leading-[1.6] sm:leading-[1.7] xl:leading-[1.75] ">
						Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex laudantium ducimus ipsam nisi consectetur
						repellat voluptatum?
				</p>
			</div>
			<div class="absolute right-24">
				<img src="/images/smi.png" alt="pong game" class="opacity-[60%] w-[250px] sm:w-[400px] md:w-[500px] xl:w-[600px] 2xl:w-[700px] 4k:w-[850px] h-auto">
			</div>
		</div>
    `
}
